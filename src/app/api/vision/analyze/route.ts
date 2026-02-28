import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";

/* ══════════════════════════════════════════════════════════
   LIXUM Vision Analyze API — POST /api/vision/analyze
   ──────────────────────────────────────────────────────────
   Receives 10 base-64 JPEG frames from the Revealer Scan,
   selects the best representative frames, and runs Claude
   Haiku Vision for comprehensive food analysis.
   ══════════════════════════════════════════════════════════ */

export const runtime     = "nodejs";
export const maxDuration = 60;

/* ── Default nutrition for unmatchable ingredients ── */
const DEFAULT_NUT = { kcal: 100, prot: 4, carbs: 12, fat: 3 };

/* ── Normalise for fuzzy comparison ── */
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

/* ════════════════════════════════════════════════════════ */
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();

    /* Auth */
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as { frames: string[] };
    const { frames } = body;

    if (!frames?.length) {
      return NextResponse.json({ error: "No frames provided" }, { status: 400 });
    }

    /* ── 1. Select best frames for vision analysis ── */
    /*  From 10 frames, pick 3 spread across the reveal:
        early (frame 1), middle (frame 5), late (frame 8). */
    const indices = [
      0,
      Math.min(Math.floor(frames.length / 2), frames.length - 1),
      Math.min(Math.floor(frames.length * 0.8), frames.length - 1),
    ];
    const selectedFrames = indices.map(i => frames[i]);

    /* ── 2. Upload all 10 frames to Supabase Storage ── */
    const timestamp = Date.now();
    const scanId    = `rev-${timestamp}`;
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

    /* ── 3. Run Claude Haiku Vision — full potential (no token cap) ── */
    let dishName: string | null = null;
    let confidence = 0;
    let aiIngredients: Array<{ name: string; grams: number; confidence: number }> = [];
    let estimatedWeight = 0;
    let cookingMethod = "mixte";
    let analysisNotes = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let visualProperties: Record<string, any> = {};

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      const imageContent = selectedFrames.map(f => ({
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: "image/jpeg" as const,
          data: f.replace(/^data:image\/\w+;base64,/, ""),
        },
      }));

      try {
        const client = new Anthropic({ apiKey });
        const msg = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          messages: [{
            role: "user",
            content: [
              ...imageContent,
              {
                type: "text",
                text: `Tu es le Moteur de Vision LIXUM — le système d'analyse alimentaire le plus avancé pour la cuisine africaine et internationale.

Ces 3 images montrent le même plat sous des angles différents (début, milieu, fin de scan). Analyse-les ensemble.

MISSION: Identification exhaustive et précise du plat et de tous ses ingrédients visibles.

INSTRUCTIONS:
1. IDENTIFICATION: Identifie le plat (nom exact, région d'origine si africain).
2. INGRÉDIENTS: Liste TOUS les ingrédients visibles avec grammage précis.
3. CUISSON: Mode de cuisson visible.
4. QUALITÉ: Propriétés visuelles (huile, sauce, friture, grillé).
5. CONFIANCE: Score de confiance global 0-100.

FORMAT JSON STRICT — aucun autre texte:
{
  "dish_name": "nom ou null",
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
  "analysis_notes": "observations détaillées"
}`,
              },
            ],
          }],
        });

        const raw = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";
        const stripped = raw.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();
        const s = stripped.indexOf("{"), e = stripped.lastIndexOf("}");

        if (s !== -1 && e !== -1) {
          const parsed = JSON.parse(stripped.slice(s, e + 1));
          confidence      = Number(parsed.confidence) || 0;
          dishName        = confidence >= 50 ? (String(parsed.dish_name || "").trim() || null) : null;
          estimatedWeight = Number(parsed.estimated_total_weight_grams) || 0;
          cookingMethod   = String(parsed.cooking_method || "mixte");
          analysisNotes   = String(parsed.analysis_notes || "");
          visualProperties = parsed.visual_properties || {};
          aiIngredients = (Array.isArray(parsed.ingredients) ? parsed.ingredients : [])
            .map((i: Record<string, unknown>) => ({
              name:       String(i.name || "").toLowerCase().trim(),
              grams:      Math.max(5, Math.min(800, Number(i.grams) || 30)),
              confidence: Number(i.confidence) || 50,
            }))
            .filter((i: { name: string }) => i.name.length > 0);
        }
      } catch {
        /* Vision failed — continue with empty results */
      }
    }

    /* ── 4. Match ingredients to DB for nutrition data ── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ingRows } = await (supabase as any)
      .from("ingredients_master")
      .select("name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prepRows } = await (supabase as any)
      .from("preparations_master")
      .select("name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g");

    const allRows: Record<string, unknown>[] = [...(ingRows ?? []), ...(prepRows ?? [])];

    const findNut = (name: string) => {
      let best: Record<string, unknown> | null = null;
      let bestScore = 0;
      for (const row of allRows) {
        const sc = similarity(name, String(row.name || ""));
        if (sc > bestScore) { bestScore = sc; best = row; }
      }
      if (bestScore >= 0.40 && best) {
        return {
          kcal: Number(best.kcal_per_100g) || DEFAULT_NUT.kcal,
          prot: Number(best.protein_per_100g) || DEFAULT_NUT.prot,
          carbs: Number(best.carbs_per_100g) || DEFAULT_NUT.carbs,
          fat: Number(best.fat_per_100g) || DEFAULT_NUT.fat,
        };
      }
      return DEFAULT_NUT;
    };

    /* ── 5. Build enriched ingredient list ── */
    const ingredients = aiIngredients.map(ai => {
      const nut = findNut(ai.name);
      const display = ai.name.charAt(0).toUpperCase() + ai.name.slice(1);
      return {
        name:           display,
        weightGrams:    ai.grams,
        kcalPer100g:    nut.kcal,
        proteinPer100g: nut.prot,
        carbsPer100g:   nut.carbs,
        fatPer100g:     nut.fat,
        confidence:     ai.confidence,
        status:         "pending" as const,
        source:         "ai" as const,
      };
    });

    /* ── 6. Calculate totals via LIXUM formula ── */
    let totalProt = 0, totalCarbs = 0, totalFat = 0;
    for (const ing of ingredients) {
      const f = ing.weightGrams / 100;
      totalProt  += ing.proteinPer100g * f;
      totalCarbs += ing.carbsPer100g * f;
      totalFat   += ing.fatPer100g * f;
    }
    const totalKcal = Math.round(totalProt * 4 + totalCarbs * 4 + totalFat * 9);

    /* ── 7. Record scan session in DB ── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("scan_history").insert({
      user_id:            user.id,
      detected_dish:      dishName ?? `Revealer Scan — ${paths.length} frames`,
      estimated_calories: totalKcal,
      estimated_weight:   estimatedWeight,
      confidence_score:   confidence / 100,
    });

    /* ── 8. Return ── */
    return NextResponse.json({
      scanId,
      paths,
      framesUploaded: paths.length,
      dishName,
      confidence,
      estimatedWeight,
      cookingMethod,
      analysisNotes,
      visualProperties,
      ingredients,
      nutrition: {
        calories: totalKcal,
        protein:  Math.round(totalProt  * 10) / 10,
        carbs:    Math.round(totalCarbs * 10) / 10,
        fat:      Math.round(totalFat   * 10) / 10,
      },
    });

  } catch (err) {
    console.error("[vision/analyze]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
