import type {
  MatchedIngredient,
  NutritionResult,
  IngredientNutrition,
  TextureType,
} from "@/types/vision-pipeline";
import { TEXTURE_CALORIE_ADJUSTMENTS } from "./estimate-portions";

/**
 * Phase 4: Calculate nutrition dynamically from matched ingredients.
 *
 * Formula per ingredient:
 *   kcal = kcal_per_100g * (matched_weight / 100) * texture_adjustment
 *   protein = protein_per_100g * (matched_weight / 100)
 *   carbs = carbs_per_100g * (matched_weight / 100)
 *   fat = fat_per_100g * (matched_weight / 100)
 *
 * NEVER uses fixed calories from meals_master.
 * Always recalculates from ingredients_master data.
 */
export function calculateNutrition(
  matchedIngredients: MatchedIngredient[],
  textureTypes: Record<string, TextureType>,
  averageDetectionConfidence: number
): NutritionResult {
  const perIngredient: IngredientNutrition[] = [];

  let totalKcal = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalWeight = 0;

  for (const ingredient of matchedIngredients) {
    const weightFactor = ingredient.matched_weight_grams / 100;
    const texture = textureTypes[ingredient.original_detected_name] || "mixed";
    const calorieAdjustment = TEXTURE_CALORIE_ADJUSTMENTS[texture];

    const kcal = ingredient.kcal_per_100g * weightFactor * calorieAdjustment;
    const protein = ingredient.protein_per_100g * weightFactor;
    const carbs = ingredient.carbs_per_100g * weightFactor;
    const fat = ingredient.fat_per_100g * weightFactor;
    const fiber = ingredient.fiber_per_100g * weightFactor;

    totalKcal += kcal;
    totalProtein += protein;
    totalCarbs += carbs;
    totalFat += fat;
    totalFiber += fiber;
    totalWeight += ingredient.matched_weight_grams;

    perIngredient.push({
      name: ingredient.name,
      weight_grams: ingredient.matched_weight_grams,
      kcal: Math.round(kcal),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      match_type: ingredient.match_type,
    });
  }

  // Calculate confidence score based on:
  // - Average AI detection confidence
  // - Proportion of ingredients with good DB matches
  const wellMatchedCount = matchedIngredients.filter(
    (i) => i.match_type === "exact" || i.match_type === "fuzzy"
  ).length;
  const matchRatio = matchedIngredients.length > 0
    ? wellMatchedCount / matchedIngredients.length
    : 0;

  const confidenceScore = Math.round(
    (averageDetectionConfidence * 0.4 + matchRatio * 0.6) * 100
  ) / 100;

  return {
    total_kcal: Math.round(totalKcal),
    total_protein: Math.round(totalProtein * 10) / 10,
    total_carbs: Math.round(totalCarbs * 10) / 10,
    total_fat: Math.round(totalFat * 10) / 10,
    total_fiber: Math.round(totalFiber * 10) / 10,
    total_weight: Math.round(totalWeight),
    confidence_score: confidenceScore,
    per_ingredient: perIngredient,
  };
}

/**
 * Recalculate nutrition after manual ingredient modifications.
 * Used in Phase 6 (user corrections).
 */
export function recalculateNutrition(
  ingredients: MatchedIngredient[]
): NutritionResult {
  // Build a neutral texture map for recalculation
  const textureMap: Record<string, TextureType> = {};
  for (const ing of ingredients) {
    textureMap[ing.original_detected_name] = "mixed";
  }

  return calculateNutrition(ingredients, textureMap, 0.9);
}
