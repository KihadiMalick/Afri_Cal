import type {
  NutritionResult,
  MatchedIngredient,
  CoherenceWarning,
  VisionDetectionResult,
} from "@/types/vision-pipeline";

/**
 * Phase: Coherence validation.
 *
 * Checks the calculated nutrition for plausibility and returns warnings
 * if the values seem off.
 *
 * Uses visual_properties for oil/friture detection instead of free-text texture.
 */
export function runCoherenceChecks(
  nutrition: NutritionResult,
  matchedIngredients: MatchedIngredient[],
  detection: VisionDetectionResult
): CoherenceWarning[] {
  const warnings: CoherenceWarning[] = [];

  // 1. Suspiciously low calories for a complete meal
  if (nutrition.total_kcal < 100 && nutrition.total_weight > 150) {
    warnings.push({
      type: "too_low",
      message:
        "Les calories semblent trop basses pour ce plat. Verification recommandee.",
      severity: "warning",
    });
  }

  // 2. Suspiciously high calories for a single plate
  if (nutrition.total_kcal > 1500) {
    warnings.push({
      type: "too_high",
      message:
        "Les calories semblent elevees. Verifiez l'estimation du poids total.",
      severity: "warning",
    });
  }

  // Very extreme case
  if (nutrition.total_kcal > 2500) {
    warnings.push({
      type: "too_high",
      message:
        "Calories tres elevees (> 2500 kcal). Le poids estime est probablement surevalue.",
      severity: "error",
    });
  }

  // 3. Oil detection check — use visual_properties + ingredient names
  const visual = detection.visual_properties;
  const oilDetected =
    visual.oil_level === "medium" ||
    visual.oil_level === "high" ||
    visual.fried_elements;

  const oilInIngredientNames = detection.ingredients.some((ing) =>
    /huile|oil|beurre|butter|frit|fried|graisse|palme/i.test(ing.name)
  );

  if (oilDetected || oilInIngredientNames) {
    const oilInMatched = matchedIngredients.some(
      (ing) =>
        /huile|oil|beurre|butter|graisse|margarine|palme/i.test(ing.name)
    );

    if (!oilInMatched) {
      warnings.push({
        type: "missing_oil",
        message:
          "De l'huile ou de la friture semble visible mais aucun ingredient gras n'a ete matche. Les calories pourraient etre sous-estimees.",
        severity: "info",
      });
    }
  }

  // 4. Check macro ratios for plausibility
  if (nutrition.total_kcal > 200) {
    const fatPercent = (nutrition.total_fat * 9) / nutrition.total_kcal;
    if (fatPercent > 0.7) {
      warnings.push({
        type: "too_high",
        message:
          "La proportion de lipides semble tres elevee (> 70% des calories).",
        severity: "info",
      });
    }
  }

  return warnings;
}
