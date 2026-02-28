"use client";

import { useState, useCallback, useId } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap, CheckCircle, Trash2, AlertTriangle, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { isValidLocale } from "@/i18n";
import { GLASS_CARD } from "@/components/lixum/LixumShell";
import ArealScan from "@/components/scan/ArealScan";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN PAGE  v2
   Phases: idle → scanning → uploading → confirming → saving → done | error
   ══════════════════════════════════════════════════════════ */

type Phase = "idle" | "scanning" | "uploading" | "confirming" | "saving" | "done" | "error";

interface ConfirmIngredient {
  key:           string;
  name:          string;
  weight:        number;   // grams, editable
  kcal100:       number;
  protein100:    number;
  carbs100:      number;
  fat100:        number;
  confirmed:     boolean;  // false = gray / true = white-green
  flagged:       boolean;  // DB says this ingredient is unexpected
  aiConfidence:  number;
}

interface Nutrition { kcal: number; protein: number; carbs: number; fat: number }

/* ── Strict LIXUM formula ── */
function calculateNutrients(list: ConfirmIngredient[]): Nutrition {
  const active = list.filter(i => i.confirmed);
  const p = active.reduce((s, i) => s + i.protein100 * i.weight / 100, 0);
  const c = active.reduce((s, i) => s + i.carbs100   * i.weight / 100, 0);
  const f = active.reduce((s, i) => s + i.fat100      * i.weight / 100, 0);
  return {
    kcal:    Math.round(p * 4 + c * 4 + f * 9),
    protein: Math.round(p * 10) / 10,
    carbs:   Math.round(c * 10) / 10,
    fat:     Math.round(f * 10) / 10,
  };
}

/* ── Fallback nutrition when no DB match ── */
const FALLBACK_NUTRITION: Record<string, Omit<ConfirmIngredient, "key"|"name"|"weight"|"confirmed"|"flagged"|"aiConfidence">> = {
  default: { kcal100: 120, protein100: 5,  carbs100: 18, fat100: 3 },
  riz:     { kcal100: 130, protein100: 2.7,carbs100: 28, fat100: 0.3 },
  poulet:  { kcal100: 165, protein100: 31, carbs100: 0,  fat100: 3.6 },
  poisson: { kcal100: 100, protein100: 20, carbs100: 0,  fat100: 2.5 },
  huile:   { kcal100: 884, protein100: 0,  carbs100: 0,  fat100: 100 },
  légume:  { kcal100: 30,  protein100: 2,  carbs100: 5,  fat100: 0.3 },
  tomate:  { kcal100: 18,  protein100: 0.9,carbs100: 3.9,fat100: 0.2 },
  oignon:  { kcal100: 40,  protein100: 1.1,carbs100: 9.3,fat100: 0.1 },
  arachide:{ kcal100: 567, protein100: 26, carbs100: 16, fat100: 49  },
};

function fallbackFor(name: string) {
  const n = name.toLowerCase();
  for (const [key, vals] of Object.entries(FALLBACK_NUTRITION)) {
    if (key !== "default" && n.includes(key)) return vals;
  }
  return FALLBACK_NUTRITION.default;
}

/* ── Inline styles ── */
const PAGE_STYLES = `
  @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  input[type=range] { -webkit-appearance:none; appearance:none; height:4px; border-radius:2px;
    background:rgba(255,255,255,.10); outline:none; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px;
    border-radius:50%; background:#00ff9d; cursor:pointer;
    box-shadow:0 0 6px rgba(0,255,157,.6); }
  input[type=range]::-moz-range-thumb { width:16px; height:16px; border:none; border-radius:50%;
    background:#00ff9d; cursor:pointer; }
`;

/* ════════════════════════════════════════════════════════ */
export default function ArealScanPage() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const supabase = createClient();
  const uid = useId();

  const [phase,       setPhase]       = useState<Phase>("idle");
  const [errorMsg,    setErrorMsg]    = useState("");
  const [uploadedPct, setUploadedPct] = useState(0);
  const [scanId,      setScanId]      = useState("");
  const [dishName,    setDishName]    = useState<string | null>(null);
  const [dishConf,    setDishConf]    = useState(0);
  const [ingredients, setIngredients] = useState<ConfirmIngredient[]>([]);

  /* ── After ArealScan fires onScanComplete ── */
  const handleScanComplete = useCallback(async (frames: string[], coverage: number) => {
    setPhase("uploading");
    setUploadedPct(10);

    try {
      const res = await fetch("/api/areal-scan", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ frames, coverage }),
      });
      setUploadedPct(60);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const result = await res.json() as {
        scanId:          string;
        framesUploaded:  number;
        coverage:        number;
        dish_name:       string | null;
        dish_confidence: number;
        ai_ingredients:  { name: string; weight: number; confidence: number }[];
      };
      setScanId(result.scanId);
      setUploadedPct(80);

      /* If no AI result → skip to done */
      if (!result.dish_name || result.ai_ingredients.length === 0) {
        setUploadedPct(100);
        setPhase("done");
        return;
      }

      setDishName(result.dish_name);
      setDishConf(result.dish_confidence);

      /* ── DB validation: look up expected ingredients for this dish ── */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: meals } = await (supabase as any)
        .from("meals_master")
        .select("id, name")
        .ilike("name", `%${result.dish_name.split(" ")[0]}%`)
        .limit(3);

      const dbExpectedNames: string[] = [];
      if (meals?.[0]?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: components } = await (supabase as any)
          .from("meal_components_master")
          .select("component_name")
          .eq("meal_id", meals[0].id);

        if (Array.isArray(components)) {
          for (const c of components) {
            if (typeof c.component_name === "string") {
              dbExpectedNames.push(c.component_name.toLowerCase());
            }
          }
        }
      }

      /* ── Build ConfirmIngredient[] ── */
      const built: ConfirmIngredient[] = [];
      for (const ing of result.ai_ingredients) {
        /* Nutrition from ingredients_master */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const keyword = ing.name.toLowerCase().split(" ").filter(w => w.length > 3)[0] ?? ing.name.split(" ")[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: dbNut } = await (supabase as any)
          .from("ingredients_master")
          .select("kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g")
          .ilike("name", `%${keyword}%`)
          .limit(1);

        const nut = dbNut?.[0] ?? fallbackFor(ing.name);

        /* Check if this ingredient is expected by the DB recipe */
        const ingLower = ing.name.toLowerCase();
        const isExpected = dbExpectedNames.length === 0 /* no DB record → don't flag */
          || dbExpectedNames.some(dn => dn.includes(ingLower.split(" ")[0]) || ingLower.includes(dn.split(" ")[0]));

        built.push({
          key:          `${uid}-${ing.name}-${Date.now()}-${Math.random()}`,
          name:         ing.name,
          weight:       ing.weight,
          kcal100:      Number(nut.kcal_per_100g     ?? nut.kcal100    ?? 120),
          protein100:   Number(nut.protein_per_100g  ?? nut.protein100 ?? 5),
          carbs100:     Number(nut.carbs_per_100g    ?? nut.carbs100   ?? 18),
          fat100:       Number(nut.fat_per_100g      ?? nut.fat100     ?? 3),
          confirmed:    isExpected,  // pre-confirmed if DB approves
          flagged:      !isExpected && dbExpectedNames.length > 0,
          aiConfidence: ing.confidence,
        });
      }

      setIngredients(built);
      setUploadedPct(100);
      setPhase("confirming");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload error");
      setPhase("error");
    }
  }, [supabase, uid]);

  /* ── Ingredient mutations ── */
  const toggleConfirm = useCallback((key: string) => {
    setIngredients(prev => prev.map(i => i.key === key ? { ...i, confirmed: !i.confirmed } : i));
  }, []);

  const removeIngredient = useCallback((key: string) => {
    setIngredients(prev => prev.filter(i => i.key !== key));
  }, []);

  const setWeight = useCallback((key: string, w: number) => {
    setIngredients(prev => prev.map(i => i.key === key ? { ...i, weight: w } : i));
  }, []);

  const confirmAll = useCallback(() => {
    setIngredients(prev => prev.map(i => ({ ...i, confirmed: true })));
  }, []);

  /* ── Save meal to DB ── */
  const handleSaveMeal = useCallback(async () => {
    setPhase("saving");
    const nut   = calculateNutrients(ingredients);
    const today = new Date().toISOString().split("T")[0];
    const hour  = new Date().getHours();
    const meal_type = hour < 10 ? "breakfast" : hour < 15 ? "lunch" : hour < 21 ? "dinner" : "snack";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("meals").insert({
      user_id:     (await supabase.auth.getUser()).data.user?.id,
      name:        dishName ?? "Repas scanné LIXUM",
      meal_type,
      calories:    nut.kcal,
      protein:     nut.protein,
      carbs:       nut.carbs,
      fat:         nut.fat,
      date:        today,
      description: `LIXUM Areal Scan · scanId:${scanId}`,
    });

    setPhase("done");
  }, [ingredients, dishName, scanId, supabase]);

  const handleCancel = useCallback(() => {
    router.push(`/${locale}/meals/scan`);
  }, [locale, router]);

  const handleContinue = useCallback(() => {
    router.push(`/${locale}/meals`);
  }, [locale, router]);

  /* ── Real-time nutrition ── */
  const nut = calculateNutrients(ingredients);

  /* ════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════ */
  return (
    <div
      className="max-w-lg mx-auto px-3 pt-5 pb-12"
      style={{ fontFamily: "'Outfit','Poppins',sans-serif" }}
    >
      <style>{PAGE_STYLES}</style>

      {/* Header */}
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
            {locale === "fr" ? "Scan spatial 3D" : "3D Spatial Scan"}
          </p>
        </div>
      </div>

      {/* ══ idle / scanning ══ */}
      {(phase === "idle" || phase === "scanning") && (
        <>
          <ArealScan locale={locale} onScanComplete={handleScanComplete} onCancel={handleCancel} />
          {phase === "idle" && (
            <div
              className="mt-4 p-4 rounded-2xl"
              style={{ background: "rgba(0,255,157,.04)", border: "1px solid rgba(0,255,157,.08)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "rgba(0,255,157,.60)" }}>
                {locale === "fr" ? "Moteur de Précision LIXUM" : "LIXUM Accuracy Engine"}
              </p>
              <p className="text-white/45 text-xs leading-relaxed">
                {locale === "fr"
                  ? "Calories = (Prot × 4) + (Gluc × 4) + (Lip × 9) · Chaque ingrédient validé contre notre base africaine."
                  : "Calories = (Prot × 4) + (Carbs × 4) + (Fat × 9) · Each ingredient cross-checked against our African database."}
              </p>
            </div>
          )}
        </>
      )}

      {/* ══ uploading ══ */}
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
              {uploadedPct < 60
                ? (locale === "fr" ? "Envoi des clichés…" : "Uploading frames…")
                : uploadedPct < 90
                  ? (locale === "fr" ? "Analyse LIXUM…" : "LIXUM analysis…")
                  : (locale === "fr" ? "Validation base africaine…" : "African DB validation…")}
            </p>
            <p className="text-white/40 text-sm">
              {locale === "fr" ? "Merci de patienter" : "Please wait"}
            </p>
          </div>
          <div className="w-full">
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
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

      {/* ══ confirming ══ */}
      {phase === "confirming" && (
        <div className="flex flex-col gap-4" style={{ animation: "slideUp .4s ease-out" }}>

          {/* Dish header */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(0,255,157,.06)", border: "1px solid rgba(0,255,157,.18)" }}
          >
            <div>
              <p className="font-black text-base text-white">{dishName}</p>
              <p className="text-xs font-semibold" style={{ color: "rgba(0,255,157,.7)" }}>
                {locale === "fr" ? `Confiance IA : ${dishConf}%` : `AI confidence: ${dishConf}%`}
                {" · "}
                {locale === "fr" ? "Recette validée ✓" : "Recipe validated ✓"}
              </p>
            </div>
            <div className="ml-auto">
              <ChevronDown size={16} style={{ color: "rgba(255,255,255,.3)" }} />
            </div>
          </div>

          {/* Real-time macro bar */}
          <div
            className="grid grid-cols-4 gap-2"
            style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "1.25rem", padding: "12px" }}
          >
            {[
              { label: locale === "fr" ? "Calories" : "Kcal",   value: `${nut.kcal}`,       unit: "kcal", color: "#00ff9d" },
              { label: locale === "fr" ? "Protéines" : "Protein",value: `${nut.protein}`,   unit: "g",    color: "#60a5fa" },
              { label: locale === "fr" ? "Glucides" : "Carbs",   value: `${nut.carbs}`,     unit: "g",    color: "#f59e0b" },
              { label: locale === "fr" ? "Lipides" : "Fat",      value: `${nut.fat}`,       unit: "g",    color: "#f472b6" },
            ].map(m => (
              <div key={m.label} className="flex flex-col items-center gap-0.5">
                <p className="font-black text-xl leading-none" style={{ color: m.color, fontFamily: "'Courier New',monospace", transition: "all .2s" }}>
                  {m.value}
                </p>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{m.unit}</p>
                <p className="text-[9px] text-white/30">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Legend + confirm-all */}
          <div className="flex items-center justify-between px-0.5">
            <p className="text-xs text-white/40 font-medium">
              {locale === "fr" ? "Cliquez ✓ pour valider chaque ingrédient" : "Tap ✓ to validate each ingredient"}
            </p>
            <button
              onClick={confirmAll}
              className="text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(0,255,157,.10)", color: "#00ff9d", border: "1px solid rgba(0,255,157,.20)" }}
            >
              {locale === "fr" ? "Tout valider" : "Confirm all"}
            </button>
          </div>

          {/* Ingredient cards */}
          <div className="flex flex-col gap-2">
            {ingredients.map(ing => {
              const ingKcal = Math.round(ing.kcal100 * ing.weight / 100);
              return (
                <div
                  key={ing.key}
                  className="rounded-2xl px-3 py-3 flex flex-col gap-2.5 transition-all duration-300"
                  style={{
                    background: ing.confirmed
                      ? "rgba(0,255,157,.07)"
                      : ing.flagged
                        ? "rgba(251,191,36,.05)"
                        : "rgba(255,255,255,.04)",
                    border: ing.confirmed
                      ? "1px solid rgba(0,255,157,.25)"
                      : ing.flagged
                        ? "1px solid rgba(251,191,36,.25)"
                        : "1px solid rgba(255,255,255,.08)",
                    opacity: ing.confirmed ? 1 : 0.72,
                  }}
                >
                  {/* Row 1: name + badges + action buttons */}
                  <div className="flex items-center gap-2">
                    {/* Status icon */}
                    {ing.flagged && !ing.confirmed
                      ? <AlertTriangle size={15} style={{ color: "#fbbf24", flexShrink: 0 }} />
                      : ing.confirmed
                        ? <CheckCircle size={15} style={{ color: "#00ff9d", flexShrink: 0 }} />
                        : <div className="w-[15px] h-[15px] rounded-full border border-white/20 flex-shrink-0" />
                    }

                    {/* Name + weight */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-bold leading-tight truncate"
                        style={{ color: ing.confirmed ? "#fff" : "rgba(255,255,255,.55)" }}
                      >
                        {ing.name}
                      </p>
                      {ing.flagged && (
                        <p className="text-[10px] font-semibold" style={{ color: "#fbbf24" }}>
                          {locale === "fr" ? "⚠ Non habituel dans ce plat" : "⚠ Unusual for this dish"}
                        </p>
                      )}
                    </div>

                    {/* Kcal estimate */}
                    <span
                      className="text-xs font-black flex-shrink-0"
                      style={{ color: ing.confirmed ? "#00ff9d" : "rgba(255,255,255,.30)", fontFamily: "'Courier New',monospace" }}
                    >
                      {ingKcal} kcal
                    </span>

                    {/* Confirm / Delete buttons */}
                    <button
                      onClick={() => toggleConfirm(ing.key)}
                      className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        background: ing.confirmed ? "rgba(0,255,157,.20)" : "rgba(255,255,255,.07)",
                        border: `1px solid ${ing.confirmed ? "rgba(0,255,157,.40)" : "rgba(255,255,255,.12)"}`,
                      }}
                    >
                      <CheckCircle size={14} strokeWidth={2.5} style={{ color: ing.confirmed ? "#00ff9d" : "rgba(255,255,255,.4)" }} />
                    </button>
                    <button
                      onClick={() => removeIngredient(ing.key)}
                      className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.15)" }}
                    >
                      <Trash2 size={13} strokeWidth={2} style={{ color: "rgba(239,68,68,.7)" }} />
                    </button>
                  </div>

                  {/* Row 2: weight slider */}
                  <div className="flex items-center gap-2.5">
                    <p className="text-[10px] text-white/35 font-bold w-7 text-right flex-shrink-0">
                      {ing.weight}g
                    </p>
                    <input
                      type="range"
                      min={5} max={500} step={5}
                      value={ing.weight}
                      onChange={e => setWeight(ing.key, Number(e.target.value))}
                      className="flex-1"
                      style={{ accentColor: "#00ff9d" }}
                    />
                    <p className="text-[10px] text-white/20 flex-shrink-0">500g</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveMeal}
            disabled={nut.kcal === 0}
            className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-black transition-all hover:brightness-110 active:scale-[.97] disabled:opacity-40"
            style={{ background: "#00ff9d", boxShadow: "0 0 24px rgba(0,255,157,.45)" }}
          >
            {locale === "fr"
              ? `Ajouter au journal · ${nut.kcal} kcal`
              : `Add to journal · ${nut.kcal} kcal`}
          </button>
        </div>
      )}

      {/* ══ saving ══ */}
      {phase === "saving" && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="loader" />
            <p className="text-sm text-white/50">{locale === "fr" ? "Enregistrement…" : "Saving…"}</p>
          </div>
        </div>
      )}

      {/* ══ done ══ */}
      {phase === "done" && (
        <div
          className="flex flex-col items-center gap-5 py-10 px-5 rounded-[2rem] text-center"
          style={{ ...GLASS_CARD, border: "1px solid rgba(0,255,157,.22)" }}
        >
          <p className="font-black text-2xl tracking-[.18em]" style={{ fontFamily: "'Courier New',monospace" }}>
            <span style={{ color: "#8b949e" }}>LI</span>
            <span style={{ color: "#00ff9d", textShadow: "0 0 12px #00ff9d" }}>X</span>
            <span style={{ color: "#8b949e" }}>UM</span>
          </p>
          <CheckCircle size={42} strokeWidth={1.5} style={{ color: "#00ff9d" }} />
          <p className="text-white font-bold text-base">
            {locale === "fr" ? "Repas ajouté au journal !" : "Meal added to journal!"}
          </p>
          <button
            onClick={handleContinue}
            className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-black"
            style={{ background: "#00ff9d", boxShadow: "0 0 24px rgba(0,255,157,.45)" }}
          >
            {locale === "fr" ? "Voir mes repas" : "View my meals"}
          </button>
        </div>
      )}

      {/* ══ error ══ */}
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
            className="px-8 py-3 rounded-xl font-bold text-sm text-white/80"
            style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.10)" }}
          >
            {locale === "fr" ? "Réessayer" : "Try again"}
          </button>
        </div>
      )}
    </div>
  );
}
