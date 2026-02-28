import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN API — v6 "Precision Mapping"
   POST /api/areal-scan
   1. Uploads frames to Supabase Storage
   2. Runs Claude Haiku vision (no token cap) → dish + ingredients
   3. Queries meals_master + meal_components_master for standard recipe
   4. Cross-checks AI ingredients vs recipe → flags inconsistencies
   5. Auto-strikes incoherent ingredients (e.g. palm oil in Tieboudienne)
   6. Fetches nutrition from ingredients_master
   7. Returns enriched result with "À confirmer" ingredient states
   ══════════════════════════════════════════════════════════ */

export const runtime    = "nodejs";
export const maxDuration = 60;

/* ── Ingredient result shape returned to client ── */
export interface IngredientResult {
  name: string;
  weightGrams: number;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  /** pending = grey / confirmed = green / removed = hidden */
  status: "pending" | "confirmed" | "removed";
  /** ai = normal · ai_flagged = barred (inconsistent with standard recipe) */
  source: "ai" | "ai_flagged";
}

/* ── Default nutrition fallback (generic dish component) ── */
const DEFAULT_NUTRITION = {
  kcal_per_100g:    100,
  protein_per_100g:   4,
  carbs_per_100g:    12,
  fat_per_100g:       3,
};

/* ── Normalize string for comparison ── */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

/* ── Simple similarity score (0-1) between two normalized strings ── */
function similarity(a: string, b: string): number {
  const na = norm(a), nb = norm(b);
  if (na === nb) return 1.0;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const wa = na.split(/\s+/), wb = nb.split(/\s+/);
  let hits = 0;
  for (const x of wa) for (const y of wb) if (x === y && x.length > 2) hits++;
  return hits / Math.max(wa.length, wb.length);
}

/* ════════════════════════════════════════════════════════ */
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();

    /* Auth */
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as { frames: string[]; coverage: number };
    const { frames, coverage } = body;

    if (!frames?.length) {
      return NextResponse.json({ error: "No frames provided" }, { status: 400 });
    }

    /* ── 1. Upload frames to Supabase Storage ── */
    const timestamp = Date.now();
    const scanId    = `${timestamp}`;
    const paths: string[] = [];

    for (let i = 0; i < frames.length; i++) {
      const base64  = frames[i].replace(/^data:image\/\w+;base64,/, "");
      const buffer  = Buffer.from(base64, "base64");
      const path    = `${user.id}/${scanId}/frame-${String(i).padStart(2, "0")}.jpg`;
      const { error } = await supabase.storage
        .from("areal-scans")
        .upload(path, buffer, { contentType: "image/jpeg", upsert: true });
      if (!error) paths.push(path);
    }

    /* ── 2. Vision analysis with Claude Haiku — FULL POTENTIAL (no token cap) ── */
    let dishName: string | null    = null;
    let aiIngredients: Array<{ name: string; grams: number }> = [];
    let estimatedWeight: number = 0;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && frames.length > 0) {
      /* Use multiple frames for better analysis:
         - Frame 0: recon frame (initial overview)
         - Middle frame: best single view
         - Send both for comprehensive analysis */
      const reconFrame = frames[0];
      const bestFrame  = frames[Math.floor(frames.length / 2)];
      const reconBase64 = reconFrame.replace(/^data:image\/\w+;base64,/, "");
      const bestBase64  = bestFrame.replace(/^data:image\/\w+;base64,/, "");

      try {
        const client = new Anthropic({ apiKey });
        const msg = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          /* No max_tokens cap — use Claude Haiku's full potential for precision */
          max_tokens: 4096,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: reconBase64 },
              },
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: bestBase64 },
              },
              {
                type: "text",
                text: `Tu es le Moteur de Précision LIXUM — le système de vision alimentaire le plus avancé pour la cuisine africaine.

MISSION: Analyse ces 2 images (vue d'ensemble + vue rapprochée) du même plat avec une précision maximale.

INSTRUCTIONS DÉTAILLÉES:
1. IDENTIFICATION: Identifie le plat principal (nom exact en cuisine africaine si possible). Si c'est un plat africain connu, donne le nom régional exact.
2. INGRÉDIENTS: Liste TOUS les ingrédients visibles avec estimation précise du poids en grammes. Sois exhaustif.
3. POIDS TOTAL: Estime le poids total de la portion visible.
4. CONTEXTE: Si tu reconnais le pays/région d'origine, indique-le.
5. CUISSON: Note le mode de cuisson visible (frit, grillé, bouilli, sauté, etc.).
6. QUALITÉ VISUELLE: Évalue les propriétés visuelles (niveau d'huile, sauce, éléments frits/grillés).

FORMAT JSON STRICT — aucun autre texte:
{
  "dish_name": "nom complet du plat ou null si confiance < 50",
  "confidence": 0-100,
  "country_guess": "pays ou null",
  "estimated_total_weight_grams": 100-2000,
  "cooking_method": "frit|grillé|bouilli|sauté|vapeur|cru|mixte",
  "ingredients": [
    {"name": "nom en français minuscule", "grams": 1-800, "confidence": 0-100}
  ],
  "visual_properties": {
    "oil_level": "low|medium|high",
    "sauce_presence": true/false,
    "fried_elements": true/false,
    "grilled_elements": true/false
  },
  "portion_size": "small|medium|large",
  "plate_fill_percentage": 0-100,
  "analysis_notes": "notes sur ce qui a été observé, particularités"
}

Règles:
- Noms d'ingrédients en français minuscule.
- Pas de limite d'ingrédients — liste TOUT ce qui est visible.
- dish_name null si confidence < 50.
- Sois précis sur les grammages, pas de valeurs par défaut.`,
              },
            ],
          }],
        });

        const raw = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";
        const stripped = raw.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();
        const s = stripped.indexOf("{"), e = stripped.lastIndexOf("}");

        if (s !== -1 && e !== -1) {
          const parsed = JSON.parse(stripped.slice(s, e + 1));
          if ((parsed.confidence ?? 0) >= 50) dishName = String(parsed.dish_name || "").trim() || null;
          estimatedWeight = Number(parsed.estimated_total_weight_grams) || 0;
          aiIngredients = (Array.isArray(parsed.ingredients) ? parsed.ingredients : [])
            .map((i: Record<string, unknown>) => ({
              name:  String(i.name  || "").toLowerCase().trim(),
              grams: Math.max(5, Math.min(800, Number(i.grams) || 30)),
            }))
            .filter((i: { name: string; grams: number }) => i.name.length > 0);
        }
      } catch {
        /* Vision failed — continue without AI ingredients */
      }
    }

    /* ── 3. Fetch standard recipe from meals_master + components ── */
    let recipeComponents: Array<{ name: string }> = [];

    if (dishName) {
      const firstWord = dishName.split(/\s+/)[0];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: mealRow } = await (supabase as any)
        .from("meals_master")
        .select("id, name")
        .ilike("name", `%${firstWord}%`)
        .limit(1)
        .single();

      if (mealRow?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: components } = await (supabase as any)
          .from("meal_components_master")
          .select("component_name")
          .eq("meal_id", mealRow.id);

        recipeComponents = (components ?? []).map(
          (c: Record<string, unknown>) => ({ name: String(c.component_name || "").toLowerCase() })
        );
      }
    }

    /* ── 4. DB coherence check + auto-strike inconsistent ingredients ── */
    const isConsistentWithRecipe = (ingName: string): boolean => {
      /* No recipe data → assume OK (can't flag what we don't know) */
      if (recipeComponents.length === 0) return true;
      const n = norm(ingName);
      return recipeComponents.some(comp => similarity(n, comp.name) >= 0.40);
    };

    /* ── 5. Fetch nutrition data from ingredients_master ── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ingredientRows } = await (supabase as any)
      .from("ingredients_master")
      .select("name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prepRows } = await (supabase as any)
      .from("preparations_master")
      .select("name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g");

    const allRows: Record<string, unknown>[] = [
      ...(ingredientRows ?? []),
      ...(prepRows ?? []),
    ];

    const findNutrition = (name: string): typeof DEFAULT_NUTRITION => {
      let best: Record<string, unknown> | null = null;
      let bestScore = 0;
      for (const row of allRows) {
        const score = similarity(name, String(row.name || ""));
        if (score > bestScore) { bestScore = score; best = row; }
      }
      if (bestScore >= 0.40 && best) {
        return {
          kcal_per_100g:    Number(best.kcal_per_100g)    || DEFAULT_NUTRITION.kcal_per_100g,
          protein_per_100g: Number(best.protein_per_100g) || DEFAULT_NUTRITION.protein_per_100g,
          carbs_per_100g:   Number(best.carbs_per_100g)   || DEFAULT_NUTRITION.carbs_per_100g,
          fat_per_100g:     Number(best.fat_per_100g)     || DEFAULT_NUTRITION.fat_per_100g,
        };
      }
      return DEFAULT_NUTRITION;
    };

    /* ── 6. Build ingredient confirmation list ── */
    /*  Intelligence Métier: inconsistent ingredients are auto-striked (status: "removed") */
    const resultIngredients: IngredientResult[] = aiIngredients.map(ai => {
      const nutrition   = findNutrition(ai.name);
      const consistent  = isConsistentWithRecipe(ai.name);
      /* Capitalise first letter */
      const displayName = ai.name.charAt(0).toUpperCase() + ai.name.slice(1);

      return {
        name:           displayName,
        weightGrams:    ai.grams,
        kcalPer100g:    nutrition.kcal_per_100g,
        proteinPer100g: nutrition.protein_per_100g,
        carbsPer100g:   nutrition.carbs_per_100g,
        fatPer100g:     nutrition.fat_per_100g,
        /* Inconsistent ingredients are auto-removed (barred) */
        status:         consistent ? "pending" : "removed",
        source:         consistent ? "ai" : "ai_flagged",
      };
    });

    /* ── 7. Record scan session ── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("scan_history").insert({
      user_id:            user.id,
      detected_dish:      dishName ?? `Areal Scan 3D — ${paths.length} frames`,
      estimated_calories: 0,
      estimated_weight:   estimatedWeight,
      confidence_score:   coverage / 100,
    });

    return NextResponse.json({
      scanId,
      paths,
      framesUploaded: paths.length,
      coverage,
      dishName,
      estimatedWeight,
      ingredients:    resultIngredients,
    });

  } catch (err) {
    console.error("[areal-scan]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
