import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN API — v4
   POST /api/areal-scan
   1. Uploads 10 frames to Supabase Storage
   2. Runs Claude Haiku vision on best frame → dish + ingredients
   3. Queries meals_master + meal_components_master for standard recipe
   4. Cross-checks AI ingredients vs recipe → flags inconsistencies
   5. Fetches nutrition from ingredients_master
   6. Returns enriched result with "À confirmer" ingredient states
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
  /** ai = normal · ai_flagged = inconsistent with standard recipe */
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

    /* ── 2. Vision analysis with Claude Haiku on best frame ── */
    let dishName: string | null    = null;
    let aiIngredients: Array<{ name: string; grams: number }> = [];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && frames.length > 0) {
      /* Use the middle frame → best balance of coverage vs early-frame noise */
      const bestFrame   = frames[Math.floor(frames.length / 2)];
      const base64Data  = bestFrame.replace(/^data:image\/\w+;base64,/, "");

      try {
        const client = new Anthropic({ apiKey });
        const msg = await client.messages.create({
          model:      "claude-haiku-4-5-20251001",
          max_tokens: 600,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: base64Data },
              },
              {
                type: "text",
                text: `Tu es AfriCalo Vision AI. JSON STRICT uniquement, aucun autre texte.
Identifie ce plat africain et ses ingrédients visibles.
Format: {"dish_name":"nom ou null","confidence":0-100,"ingredients":[{"name":"nom","grams":1-500}]}
Règles: dish_name null si confidence<60. Noms en français minuscule. Max 8 ingrédients.`,
              },
            ],
          }],
        });

        const raw = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";
        const stripped = raw.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();
        const s = stripped.indexOf("{"), e = stripped.lastIndexOf("}");

        if (s !== -1 && e !== -1) {
          const parsed = JSON.parse(stripped.slice(s, e + 1));
          if ((parsed.confidence ?? 0) >= 60) dishName = String(parsed.dish_name || "").trim() || null;
          aiIngredients = (Array.isArray(parsed.ingredients) ? parsed.ingredients : [])
            .slice(0, 8)
            .map((i: Record<string, unknown>) => ({
              name:  String(i.name  || "").toLowerCase().trim(),
              grams: Math.max(5, Math.min(500, Number(i.grams) || 30)),
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

    /* ── 4. DB coherence check: is each AI ingredient consistent with standard recipe? ── */
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
        status:         "pending",
        source:         consistent ? "ai" : "ai_flagged",
      };
    });

    /* ── 7. Record scan session ── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("scan_history").insert({
      user_id:            user.id,
      detected_dish:      dishName ?? `Areal Scan 3D — ${paths.length} frames`,
      estimated_calories: 0,
      estimated_weight:   0,
      confidence_score:   coverage / 100,
    });

    return NextResponse.json({
      scanId,
      paths,
      framesUploaded: paths.length,
      coverage,
      dishName,
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
