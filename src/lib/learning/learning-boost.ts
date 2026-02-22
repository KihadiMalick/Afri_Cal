import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  VisionDetectionResult,
  LearningBoost,
  MatchedIngredient,
} from "@/types/vision-pipeline";

/**
 * Query correction history and generate a learning boost for the current scan.
 *
 * Strategy:
 * 1. Look up corrections where the original dish or ingredients overlap
 * 2. If a dish has been corrected > 5 times → strong boost
 * 3. If matching ingredient pattern found → adjust weights
 * 4. Returns a LearningBoost with adjustments to apply
 *
 * All learning is backend-driven — no corrections are sent to the AI prompt.
 */
export async function getLearningBoost(
  supabase: SupabaseClient,
  detection: VisionDetectionResult
): Promise<LearningBoost> {
  const noBoost: LearningBoost = {
    suggested_dish_name: null,
    ingredient_adjustments: {},
    correction_count: 0,
    confidence_boost: 0,
  };

  const detectedNames = detection.ingredients.map((i) =>
    i.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
  );

  if (detectedNames.length === 0) return noBoost;

  // Query corrections that match any of the detected ingredient names
  // We search for corrections where the original detection had similar ingredients
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: corrections } = await (supabase as any)
    .from("scan_corrections")
    .select(
      "corrected_dish_name, corrected_ingredients_json, original_ingredients_json, original_detected_dish_name"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (!corrections || corrections.length === 0) return noBoost;

  // Score each correction by ingredient overlap with current detection
  interface ScoredCorrection {
    correctedDish: string;
    overlap: number;
    correctedIngredients: CorrectedIngredient[];
  }

  interface CorrectedIngredient {
    name: string;
    original_detected_name?: string;
    matched_weight_grams: number;
    kcal_per_100g?: number;
    protein_per_100g?: number;
    carbs_per_100g?: number;
    fat_per_100g?: number;
    fiber_per_100g?: number;
  }

  const scored: ScoredCorrection[] = [];

  for (const correction of corrections) {
    const origIngredients = (correction.original_ingredients_json || []) as Array<{
      name: string;
    }>;

    const origNames = origIngredients.map((i: { name: string }) =>
      i.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
    );

    // Calculate ingredient overlap (Jaccard-like)
    const union = new Set([...detectedNames, ...origNames]);
    const intersection = detectedNames.filter((n) =>
      origNames.some(
        (o) => o === n || o.includes(n) || n.includes(o)
      )
    );

    const overlap = union.size > 0 ? intersection.length / union.size : 0;

    if (overlap >= 0.3) {
      scored.push({
        correctedDish: correction.corrected_dish_name,
        overlap,
        correctedIngredients: correction.corrected_ingredients_json || [],
      });
    }
  }

  if (scored.length === 0) return noBoost;

  // Group by corrected dish name and count occurrences
  const dishCounts: Record<string, { count: number; totalOverlap: number; ingredients: CorrectedIngredient[][] }> = {};

  for (const s of scored) {
    if (!dishCounts[s.correctedDish]) {
      dishCounts[s.correctedDish] = { count: 0, totalOverlap: 0, ingredients: [] };
    }
    dishCounts[s.correctedDish].count++;
    dishCounts[s.correctedDish].totalOverlap += s.overlap;
    dishCounts[s.correctedDish].ingredients.push(s.correctedIngredients);
  }

  // Find the most corrected dish
  let bestDish: string | null = null;
  let bestCount = 0;
  let bestAvgOverlap = 0;

  for (const [dish, stats] of Object.entries(dishCounts)) {
    if (stats.count > bestCount || (stats.count === bestCount && stats.totalOverlap / stats.count > bestAvgOverlap)) {
      bestDish = dish;
      bestCount = stats.count;
      bestAvgOverlap = stats.totalOverlap / stats.count;
    }
  }

  // Build ingredient weight adjustments from corrections
  const ingredientAdjustments: Record<string, { boost_weight_g: number; correction_count: number }> = {};

  if (bestDish && dishCounts[bestDish]) {
    const allCorrectedIngredients = dishCounts[bestDish].ingredients.flat();

    // Average the corrected weights by ingredient name
    const weightSums: Record<string, { total: number; count: number }> = {};
    for (const ing of allCorrectedIngredients) {
      const name = (ing.original_detected_name || ing.name).toLowerCase().trim();
      if (!weightSums[name]) weightSums[name] = { total: 0, count: 0 };
      weightSums[name].total += ing.matched_weight_grams;
      weightSums[name].count++;
    }

    for (const [name, stats] of Object.entries(weightSums)) {
      if (stats.count >= 2) {
        ingredientAdjustments[name] = {
          boost_weight_g: Math.round(stats.total / stats.count),
          correction_count: stats.count,
        };
      }
    }
  }

  // Confidence boost: stronger if many corrections agree
  // 0-0.05 for 2-4 corrections, 0.05-0.10 for 5-9, 0.10-0.15 for 10+
  let confidenceBoost = 0;
  if (bestCount >= 10) confidenceBoost = 0.15;
  else if (bestCount >= 5) confidenceBoost = 0.05 + (bestCount - 5) * 0.01;
  else if (bestCount >= 2) confidenceBoost = bestCount * 0.015;

  return {
    suggested_dish_name: bestCount >= 5 ? bestDish : null,
    ingredient_adjustments: ingredientAdjustments,
    correction_count: bestCount,
    confidence_boost: Math.min(0.15, confidenceBoost),
  };
}

/**
 * Apply learning boost to matched ingredients.
 * Adjusts weights based on historical corrections.
 */
export function applyLearningBoost(
  ingredients: MatchedIngredient[],
  boost: LearningBoost
): MatchedIngredient[] {
  if (boost.correction_count < 2) return ingredients;

  return ingredients.map((ing) => {
    const normalizedName = ing.original_detected_name.toLowerCase().trim();
    const adjustment = boost.ingredient_adjustments[normalizedName];

    if (adjustment && adjustment.correction_count >= 3) {
      // Blend the corrected weight with the detected weight
      // Strength depends on correction count: 3→30%, 5→50%, 10+→70%
      const blendFactor = Math.min(0.7, adjustment.correction_count * 0.1);
      const adjustedWeight = Math.round(
        ing.matched_weight_grams * (1 - blendFactor) +
        adjustment.boost_weight_g * blendFactor
      );

      return {
        ...ing,
        matched_weight_grams: adjustedWeight,
        match_confidence: Math.min(1, ing.match_confidence + boost.confidence_boost),
        match_type: "learned" as const,
      };
    }

    return ing;
  });
}
