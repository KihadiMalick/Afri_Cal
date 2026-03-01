import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";

/* ══════════════════════════════════════════════════════════
   LIXUM Vision Process API — POST /api/vision/process
   ──────────────────────────────────────────────────────────
   Receives 12 base-64 JPEG frames from Gyro·Target·Lock
   (4 angles × 3 frames). Selects one representative frame
   per angle for Claude Haiku Vision, uploads all 12 to
   Supabase Storage, runs ingredient matching + Atwater
   nutrition calculation, and applies dish-specific business
   rules (e.g. exclude palm oil for Tiéboudienne).
   ══════════════════════════════════════════════════════════ */

export const runtime     = "nodejs";
export const maxDuration = 60;

/* ── Default nutrition (unmatchable ingredients) ── */
const DEFAULT_NUT = { kcal: 100, prot: 4, carbs: 12, fat: 3 };

/* ── String normalization + fuzzy similarity ── */
function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "").trim();
}
function similarity(a: string, b: string): number {
  const na = norm(a), nb = norm(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const wa = na.split(/\s+/), wb = nb.split(/\s+/);
  let hits = 0;
  for (const x of wa) for (const y of wb) if (x === y && x.length > 2) hits++;
  return hits / Math.max(wa.length, wb.length);
}

/* ── Business intelligence: dish-specific exclusion rules ── */
interface DishRule {
  /** Ingredients auto-flagged as "removed" when this dish is detected. */
  excludeIngredients: string[];
}

const DISH_RULES: Record<string, DishRule> = {
  /* Sénégal */
  "tiéboudieune":   { excludeIngredients: ["huile de palme", "palmiste", "palm oil"] },
  "tiéboudienne":   { excludeIngredients: ["huile de palme", "palmiste"] },
  "thiéboudienne":  { excludeIngredients: ["huile de palme", "palmiste"] },
  "ceebu jen":      { excludeIngredients: ["huile de palme"] },
  "ceebu yapp":     { excludeIngredients: ["huile de palme"] },
  /* Pays-Bas / universel — pas d'exclusion, huile de palme attendue */
  "mafé":           { excludeIngredients: [] },
  "ndolé":          { excludeIngredients: [] },
  "egusi":          { excludeIngredients: [] },
  "jollof":         { excludeIngredients: [] },
  "yassa":          { excludeIngredients: [] },
  "poulet yassa":   { excludeIngredients: [] },
  "thiébou dieune": { excludeIngredients: ["huile de palme", "palmiste"] },
};

function getDishRule(dishName: string): DishRule | null {
  const nd = norm(dishName);
  for (const [key, rule] of Object.entries(DISH_RULES)) {
    if (similarity(nd, norm(key)) >= 0.75 || nd.includes(norm(key)) || norm(key).includes(nd)) {
      return rule;
    }
  }
  return null;
}

/* ════════════════════════════════════════════════════════ */
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();

    /* ── Auth ── */
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as { frames: string[] };
    const { frames } = body;
    if (!frames?.length) {
      return NextResponse.json({ error: "No frames provided" }, { status: 400 });
    }

    /* ── 1. Select 4 representative frames (one per angle) ── */
    /*  Gyro·Target·Lock captures 3 frames per angle in order:
        frames[0-2] = Top · frames[3-5] = Left
        frames[6-8] = Right · frames[9-11] = Bottom
        → pick middle frame of each burst for sharpest result.    */
    const BURST = 3;
    const selectedIdx = Array.from({ length: Math.min(4, Math.floor(frames.length / BURST)) },
      (_, a) => a * BURST + Math.floor(BURST / 2));
    const selectedFrames = selectedIdx.map(i => frames[Math.min(i, frames.length - 1)]);

    /* ── 2. Upload all frames to Supabase Storage ── */
    const timestamp = Date.now();
    const scanId    = `gyro-${timestamp}`;
    const paths: string[] = [];

    for (let i = 0; i < frames.length; i++) {
      const base64 = frames[i].replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64, "base64");
      const path   = `${user.id}/${scanId}/frame-${String(i).padStart(2, "0")}.jpg`;
      const { error } = await supabase.storage
        .from("areal-scans")
        .upload(path, buffer, { contentType: "image/jpeg", upsert: true });
      if (!error) paths.push(path);
    }

    /* ── 3. Claude Haiku Vision (4 angles) ── */
    let dishName: string | null = null;
    let confidence    = 0;
    let estimatedWeight  = 0;
    let cookingMethod    = "mixte";
    let analysisNotes    = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let visualProperties: Record<string, any> = {};
    let aiIngredients: Array<{ name: string; grams: number; confidence: number }> = [];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && selectedFrames.length) {
      const imageContent = selectedFrames.map(f => ({
        type: "image" as const,
        source: {
          type:       "base64" as const,
          media_type: "image/jpeg" as const,
          data:       f.replace(/^data:image\/\w+;base64,/, ""),
        },
      }));

      try {
        const client = new Anthropic({ apiKey });
        const msg = await client.messages.create({
          model:      "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          messages: [{
            role: "user",
            content: [
              ...imageContent,
              {
                type: "text",
                text: `Tu es le Moteur de Vision LIXUM — système d'analyse alimentaire de précision pour la cuisine africaine et internationale.

Ces ${selectedFrames.length} images montrent le même plat sous ${selectedFrames.length} angles différents capturés par Gyro·Target·Lock (dessus, gauche, droite, dessous). Analyse-les ensemble pour une identification maximale.

MISSION: Identification exhaustive du plat, de tous ses ingrédients et de leur grammage précis.

INSTRUCTIONS:
1. IDENTIFICATION: Nom exact du plat + région d'origine si africain.
2. VOLUME: Estime le poids total en croisant les ${selectedFrames.length} angles.
3. INGRÉDIENTS: Liste TOUS les ingrédients visibles avec grammage précis (grammes).
4. CUISSON: Mode de cuisson observable.
5. QUALITÉ VISUELLE: Niveau d'huile, sauce, friture, grillade.
6. CONFIANCE: Score global 0-100.

FORMAT JSON STRICT — aucun autre texte:
{
  "dish_name": "nom exact ou null",
  "confidence": 0-100,
  "country_guess": "pays ou null",
  "estimated_total_weight_grams": 100-2000,
  "cooking_method": "frit|grillé|bouilli|sauté|vapeur|cru|mixte",
  "ingredients": [
    {"name": "nom en français minuscule", "grams": 1-800, "confidence": 0-100}
  ],
  "visual_properties": {
    "oil_level": "low|medium|high",
    "sauce_presence": true,
    "fried_elements": false,
    "grilled_elements": false
  },
  "portion_size": "small|medium|large",
  "analysis_notes": "observations détaillées basées sur les ${selectedFrames.length} angles"
}`,
              },
            ],
          }],
        });

        const raw      = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";
        const stripped = raw.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();
        const s = stripped.indexOf("{"), e = stripped.lastIndexOf("}");

        if (s !== -1 && e !== -1) {
          const parsed = JSON.parse(stripped.slice(s, e + 1));
          confidence       = Number(parsed.confidence)                   || 0;
          dishName         = confidence >= 50 ? (String(parsed.dish_name || "").trim() || null) : null;
          estimatedWeight  = Number(parsed.estimated_total_weight_grams) || 0;
          cookingMethod    = String(parsed.cooking_method || "mixte");
          analysisNotes    = String(parsed.analysis_notes || "");
          visualProperties = parsed.visual_properties || {};
          aiIngredients    = (Array.isArray(parsed.ingredients) ? parsed.ingredients : [])
            .map((i: Record<string, unknown>) => ({
              name:       String(i.name || "").toLowerCase().trim(),
              grams:      Math.max(5, Math.min(800, Number(i.grams) || 30)),
              confidence: Number(i.confidence) || 50,
            }))
            .filter((i: { name: string }) => i.name.length > 0);
        }
      } catch {
        /* Vision failed — continue with empty ingredients */
      }
    }

    /* ── 4. Nutrition DB lookup ── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ingRows  } = await (supabase as any).from("ingredients_master")
      .select("name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prepRows } = await (supabase as any).from("preparations_master")
      .select("name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g");

    const allRows: Record<string, unknown>[] = [...(ingRows ?? []), ...(prepRows ?? [])];

    const findNut = (name: string) => {
      let best: Record<string, unknown> | null = null, top = 0;
      for (const row of allRows) {
        const sc = similarity(name, String(row.name || ""));
        if (sc > top) { top = sc; best = row; }
      }
      if (top >= 0.40 && best) {
        return {
          kcal:  Number(best.kcal_per_100g)    || DEFAULT_NUT.kcal,
          prot:  Number(best.protein_per_100g) || DEFAULT_NUT.prot,
          carbs: Number(best.carbs_per_100g)   || DEFAULT_NUT.carbs,
          fat:   Number(best.fat_per_100g)     || DEFAULT_NUT.fat,
        };
      }
      return DEFAULT_NUT;
    };

    /* ── 5. Apply business rules ── */
    const rule         = dishName ? getDishRule(dishName) : null;
    const excludedList = rule?.excludeIngredients ?? [];

    const isExcluded = (name: string) =>
      excludedList.some(excl => similarity(name, excl) >= 0.70);

    /* ── 6. Build enriched ingredient list ── */
    const ingredients = aiIngredients.map(ai => {
      const nut      = findNut(ai.name);
      const excluded = isExcluded(ai.name);
      return {
        name:           ai.name.charAt(0).toUpperCase() + ai.name.slice(1),
        weightGrams:    ai.grams,
        kcalPer100g:    nut.kcal,
        proteinPer100g: nut.prot,
        carbsPer100g:   nut.carbs,
        fatPer100g:     nut.fat,
        confidence:     ai.confidence,
        status:         excluded ? "removed"     as const : "pending"    as const,
        source:         excluded ? "ai_flagged"  as const : "ai"         as const,
      };
    });

    /* ── 7. Atwater totals: Cal = (Prot×4) + (Carbs×4) + (Fat×9) ── */
    let totalProt = 0, totalCarbs = 0, totalFat = 0;
    for (const ing of ingredients) {
      if (ing.status === "removed") continue;
      const f = ing.weightGrams / 100;
      totalProt  += ing.proteinPer100g * f;
      totalCarbs += ing.carbsPer100g  * f;
      totalFat   += ing.fatPer100g    * f;
    }
    const totalKcal = Math.round(totalProt * 4 + totalCarbs * 4 + totalFat * 9);

    /* ── 8. Record scan session ── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("scan_history").insert({
      user_id:            user.id,
      detected_dish:      dishName ?? `Gyro·Target·Lock — ${paths.length} frames`,
      estimated_calories: totalKcal,
      estimated_weight:   estimatedWeight,
      confidence_score:   confidence / 100,
    });

    /* ── 9. Return ── */
    return NextResponse.json({
      scanId,
      paths,
      framesUploaded:  paths.length,
      anglesLocked:    selectedFrames.length,
      dishName,
      confidence,
      estimatedWeight,
      cookingMethod,
      analysisNotes,
      visualProperties,
      appliedRule:     rule ? { excludedIngredients: excludedList } : null,
      ingredients,
      nutrition: {
        calories: totalKcal,
        protein:  Math.round(totalProt  * 10) / 10,
        carbs:    Math.round(totalCarbs * 10) / 10,
        fat:      Math.round(totalFat   * 10) / 10,
      },
    });

  } catch (err) {
    console.error("[vision/process]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
