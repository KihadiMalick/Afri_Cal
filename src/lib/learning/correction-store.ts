import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  VisionDetectionResult,
  MatchedIngredient,
} from "@/types/vision-pipeline";

/**
 * Save a user correction to the scan_corrections table.
 *
 * Stores the original detection alongside the user-corrected data
 * for progressive learning across all users.
 */
export async function saveCorrection(
  supabase: SupabaseClient,
  params: {
    userId: string;
    scanId: string | null;
    originalDetection: VisionDetectionResult;
    correctedDishName: string;
    correctedIngredients: MatchedIngredient[];
    imageHash: string | null;
  }
): Promise<void> {
  const {
    userId,
    scanId,
    originalDetection,
    correctedDishName,
    correctedIngredients,
    imageHash,
  } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("scan_corrections").insert({
    user_id: userId,
    scan_id: scanId || null,
    original_detected_dish_name: originalDetection.dish_name,
    original_ingredients_json: originalDetection.ingredients,
    corrected_dish_name: correctedDishName,
    corrected_ingredients_json: correctedIngredients.map((ing) => ({
      name: ing.name,
      original_detected_name: ing.original_detected_name,
      matched_weight_grams: ing.matched_weight_grams,
      kcal_per_100g: ing.kcal_per_100g,
      protein_per_100g: ing.protein_per_100g,
      carbs_per_100g: ing.carbs_per_100g,
      fat_per_100g: ing.fat_per_100g,
      fiber_per_100g: ing.fiber_per_100g,
    })),
    image_hash: imageHash,
  });
}

/**
 * Generate an ingredient pattern signature for similarity matching.
 * Sorts ingredient names alphabetically and joins them.
 */
export function generateIngredientPattern(ingredientNames: string[]): string {
  return ingredientNames
    .map((n) =>
      n
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
    )
    .sort()
    .join("|");
}
