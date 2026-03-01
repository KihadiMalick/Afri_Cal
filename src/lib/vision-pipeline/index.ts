import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  VisionDetectionResult,
  ScanPipelineResult,
  MatchedIngredient,
} from "@/types/vision-pipeline";
import { estimateIngredientWeights, resolveTextureFromVisualProperties } from "./estimate-portions";
import { matchIngredientsToDatabase } from "./match-ingredients";
import { calculateNutrition, recalculateNutrition } from "./calculate-nutrition";
import { runCoherenceChecks } from "./coherence-checks";
import { getLearningBoost, applyLearningBoost } from "@/lib/learning";

export { estimateIngredientWeights } from "./estimate-portions";
export { matchIngredientsToDatabase } from "./match-ingredients";
export { calculateNutrition, recalculateNutrition } from "./calculate-nutrition";
export { runCoherenceChecks } from "./coherence-checks";

/**
 * Derive a meal name from detection data.
 * Uses AI-detected dish name if available, otherwise builds from ingredients.
 */
function deriveMealName(detection: VisionDetectionResult): string {
  // Use AI-detected name if confidence was high enough (>= 60%)
  if (detection.dish_name) {
    return detection.dish_name;
  }

  // Fallback: build from top 3 ingredient names
  const names = detection.ingredients
    .slice(0, 3)
    .map((ing) => ing.name);

  if (names.length === 0) return "Plat non identifie";
  return names.join(", ");
}

/**
 * Main pipeline orchestrator: scanFood
 *
 * Executes the full scan pipeline:
 * 1. Takes the vision detection result (from API route)
 * 2. Estimates ingredient portions (Phase 2)
 * 3. Matches ingredients to Supabase database (Phase 3)
 * 4. Applies learning boost from correction history
 * 5. Calculates nutrition dynamically (Phase 4)
 * 6. Runs coherence checks
 * 7. Returns complete result with visual_properties + country_guess
 */
export async function scanFood(
  supabase: SupabaseClient,
  detectionResult: VisionDetectionResult
): Promise<ScanPipelineResult> {
  // Phase 2: Map ingredients (weights already provided by AI)
  const estimatedIngredients = estimateIngredientWeights(detectionResult);

  // Phase 3: Match with database
  let matchedIngredients = await matchIngredientsToDatabase(
    supabase,
    estimatedIngredients
  );

  // Learning: Query correction history and apply boosts
  let learningApplied = false;
  const boost = await getLearningBoost(supabase, detectionResult);

  if (boost.correction_count >= 2) {
    matchedIngredients = applyLearningBoost(matchedIngredients, boost);
    learningApplied = true;
  }

  // Derive texture from visual_properties
  const globalTexture = resolveTextureFromVisualProperties(detectionResult.visual_properties);

  // Average detection confidence (convert 0-100 to 0-1)
  const avgConfidence = detectionResult.confidence / 100;

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

  // Overall confidence (with learning boost)
  let confidenceScore = Math.round(
    (avgConfidence * 0.3 + nutrition.confidence_score * 0.7) * 100
  ) / 100;

  if (learningApplied) {
    confidenceScore = Math.min(1, confidenceScore + boost.confidence_boost);
  }

  // Derive meal name (use learning suggestion if strong enough, else AI/fallback)
  let detectedMealName: string;
  if (boost.suggested_dish_name && boost.correction_count >= 5) {
    detectedMealName = boost.suggested_dish_name;
  } else {
    detectedMealName = deriveMealName(detectionResult);
  }

  // Use portion_size from AI detection directly
  const portionSize = detectionResult.portion_size;

  return {
    detected_meal_name: detectedMealName,
    portion_size: portionSize,
    visual_properties: detectionResult.visual_properties,
    country_guess: detectionResult.country_guess,
    plate_fill_percentage: detectionResult.plate_fill_percentage,
    ingredients: matchedIngredients,
    nutrition,
    warnings,
    learning_applied: learningApplied,
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

  const avgConfidence = currentResult.detection_raw.confidence / 100;
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
