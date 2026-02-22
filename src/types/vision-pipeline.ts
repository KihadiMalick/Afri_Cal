// ============================================================
// Vision Pipeline Types — AfriCalo Scan Intelligent
// Optimized for minimal token usage
// ============================================================

/** Texture type for caloric density adjustment */
export type TextureType = "oily" | "dry" | "saucy" | "mixed";

/** Certainty level for ingredient detection */
export type CertaintyLevel = "high" | "medium" | "low";

/** Portion size derived from total weight */
export type PortionSize = "small" | "medium" | "large";

// ---- Phase 1: Vision Detection (optimized token format) ----

/** Single ingredient detected by vision AI */
export interface DetectedIngredient {
  name: string;
  estimated_weight_g: number;
  confidence: number; // 0-100
  certainty: CertaintyLevel;
}

/** Raw output from the vision API (Phase 1) — optimized JSON-only format */
export interface VisionDetectionResult {
  estimated_total_weight_g: number;
  ingredients: DetectedIngredient[];
  texture: string; // dominant texture: "huileux", "sec", "sauce", "frit", etc.
  overall_confidence: number; // 0-100
}

// ---- Phase 2: Portion Estimation ----

/** Ingredient with estimated weight in grams */
export interface EstimatedIngredient {
  normalized_name: string;
  original_name: string;
  estimated_weight_grams: number;
  texture_type: TextureType;
  confidence: number;
}

// ---- Phase 3: Database Matching ----

/** Ingredient matched against Supabase ingredients_master */
export interface MatchedIngredient {
  ingredient_id: string | null;
  name: string;
  original_detected_name: string;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  matched_weight_grams: number;
  match_type: "exact" | "fuzzy" | "category_fallback" | "approximate_estimation";
  match_confidence: number;
}

// ---- Phase 4: Nutrition Calculation ----

/** Final nutrition result for the scanned plate */
export interface NutritionResult {
  total_kcal: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_weight: number;
  confidence_score: number;
  per_ingredient: IngredientNutrition[];
}

/** Nutrition breakdown for a single matched ingredient */
export interface IngredientNutrition {
  name: string;
  weight_grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  match_type: MatchedIngredient["match_type"];
}

// ---- Coherence ----

/** Warning generated during coherence checks */
export interface CoherenceWarning {
  type: "too_low" | "too_high" | "missing_oil" | "recalculated";
  message: string;
  severity: "info" | "warning" | "error";
}

// ---- Pipeline Result ----

/** Complete result of the scan pipeline */
export interface ScanPipelineResult {
  // Detection
  detected_meal_name: string;
  portion_size: PortionSize;

  // Matched ingredients with nutrition
  ingredients: MatchedIngredient[];

  // Aggregated nutrition
  nutrition: NutritionResult;

  // Coherence
  warnings: CoherenceWarning[];

  // Meta
  confidence_score: number;
  detection_raw: VisionDetectionResult;
}
