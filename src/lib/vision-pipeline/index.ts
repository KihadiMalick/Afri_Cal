import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  VisionDetectionResult,
  ScanPipelineResult,
  TextureType,
  MatchedIngredient,
} from "@/types/vision-pipeline";
import { estimateIngredientWeights } from "./estimate-portions";
import { matchIngredientsToDatabase } from "./match-ingredients";
import { calculateNutrition, recalculateNutrition } from "./calculate-nutrition";
import { runCoherenceChecks } from "./coherence-checks";

export { estimateIngredientWeights } from "./estimate-portions";
export { matchIngredientsToDatabase } from "./match-ingredients";
export { calculateNutrition, recalculateNutrition } from "./calculate-nutrition";
export { runCoherenceChecks } from "./coherence-checks";

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
  // Phase 2: Estimate portions
  const estimatedIngredients = estimateIngredientWeights(detectionResult);

  // Phase 3: Match with database
  const matchedIngredients = await matchIngredientsToDatabase(
    supabase,
    estimatedIngredients
  );

  // Build texture map from detection
  const textureMap: Record<string, TextureType> = {};
  for (const ing of detectionResult.ingredients_detected) {
    textureMap[ing.name] = ing.texture_type;
  }

  // Average detection confidence
  const avgConfidence =
    detectionResult.ingredients_detected.length > 0
      ? detectionResult.ingredients_detected.reduce(
          (sum, ing) => sum + ing.confidence,
          0
        ) / detectionResult.ingredients_detected.length
      : detectionResult.confidence;

  // Phase 4: Calculate nutrition
  const nutrition = calculateNutrition(
    matchedIngredients,
    textureMap,
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
    (detectionResult.confidence * 0.3 + nutrition.confidence_score * 0.7) * 100
  ) / 100;

  return {
    detected_meal_name: detectionResult.detected_meal_name,
    portion_size: detectionResult.portion_size,
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

  const confidenceScore = Math.round(
    (currentResult.detection_raw.confidence * 0.3 + nutrition.confidence_score * 0.7) * 100
  ) / 100;

  return {
    ...currentResult,
    ingredients: updatedIngredients,
    nutrition,
    warnings,
    confidence_score: confidenceScore,
  };
}
