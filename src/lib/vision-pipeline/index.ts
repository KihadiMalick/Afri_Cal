import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  VisionDetectionResult,
  ScanPipelineResult,
  PortionSize,
  MatchedIngredient,
} from "@/types/vision-pipeline";
import { estimateIngredientWeights, resolveTextureType } from "./estimate-portions";
import { matchIngredientsToDatabase } from "./match-ingredients";
import { calculateNutrition, recalculateNutrition } from "./calculate-nutrition";
import { runCoherenceChecks } from "./coherence-checks";

export { estimateIngredientWeights } from "./estimate-portions";
export { matchIngredientsToDatabase } from "./match-ingredients";
export { calculateNutrition, recalculateNutrition } from "./calculate-nutrition";
export { runCoherenceChecks } from "./coherence-checks";

/**
 * Derive a meal name from the top ingredients.
 * Since the optimized prompt no longer asks for meal name,
 * we build one from the first 3 ingredient names.
 */
function deriveMealName(detection: VisionDetectionResult): string {
  const names = detection.ingredients
    .slice(0, 3)
    .map((ing) => ing.name);

  if (names.length === 0) return "Plat non identifie";
  return names.join(", ");
}

/**
 * Derive portion size from total weight.
 */
function derivePortionSize(weightG: number): PortionSize {
  if (weightG < 250) return "small";
  if (weightG <= 400) return "medium";
  return "large";
}

/**
 * Main pipeline orchestrator: scanFood
 *
 * Executes the full scan pipeline:
 * 1. Takes the vision detection result (from API route)
 * 2. Estimates ingredient portions (Phase 2)
 * 3. Matches ingredients to Supabase database (Phase 3)
 * 4. Calculates nutrition dynamically (Phase 4)
 * 5. Runs coherence checks
 * 6. Returns complete result
 */
export async function scanFood(
  supabase: SupabaseClient,
  detectionResult: VisionDetectionResult
): Promise<ScanPipelineResult> {
  // Phase 2: Map ingredients (weights already provided by AI)
  const estimatedIngredients = estimateIngredientWeights(detectionResult);

  // Phase 3: Match with database
  const matchedIngredients = await matchIngredientsToDatabase(
    supabase,
    estimatedIngredients
  );

  // Resolve global texture type
  const globalTexture = resolveTextureType(detectionResult.texture);

  // Average detection confidence (convert 0-100 to 0-1)
  const avgConfidence = detectionResult.overall_confidence / 100;

  // Phase 4: Calculate nutrition (backend-side)
  const nutrition = calculateNutrition(
    matchedIngredients,
    globalTexture,
    avgConfidence
  );

  // Phase 5 (coherence): Run checks
  const warnings = runCoherenceChecks(
    nutrition,
    matchedIngredients,
    detectionResult
  );

  // Overall confidence
  const confidenceScore = Math.round(
    (avgConfidence * 0.3 + nutrition.confidence_score * 0.7) * 100
  ) / 100;

  // Derive meal name and portion size from detection data
  const detectedMealName = deriveMealName(detectionResult);
  const portionSize = derivePortionSize(detectionResult.estimated_total_weight_g);

  return {
    detected_meal_name: detectedMealName,
    portion_size: portionSize,
    ingredients: matchedIngredients,
    nutrition,
    warnings,
    confidence_score: confidenceScore,
    detection_raw: detectionResult,
  };
}

/**
 * Phase 6: Adjust ingredients manually and recalculate.
 *
 * Allows the user to:
 * - Add ingredients
 * - Remove ingredients
 * - Modify grams
 * - Optionally override calories
 *
 * Returns a new ScanPipelineResult with recalculated values.
 */
export function adjustIngredientsManually(
  currentResult: ScanPipelineResult,
  updatedIngredients: MatchedIngredient[]
): ScanPipelineResult {
  const nutrition = recalculateNutrition(updatedIngredients);

  const warnings = runCoherenceChecks(
    nutrition,
    updatedIngredients,
    currentResult.detection_raw
  );

  const avgConfidence = currentResult.detection_raw.overall_confidence / 100;
  const confidenceScore = Math.round(
    (avgConfidence * 0.3 + nutrition.confidence_score * 0.7) * 100
  ) / 100;

  return {
    ...currentResult,
    ingredients: updatedIngredients,
    nutrition,
    warnings,
    confidence_score: confidenceScore,
  };
}
