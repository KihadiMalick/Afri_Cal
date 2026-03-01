// ============================================================
// Vision Pipeline Types — AfriCalo Vision AI
// Priority dish recognition + visual properties analysis
// ============================================================

/** Texture type for caloric density adjustment */
export type TextureType = "oily" | "dry" | "saucy" | "fried" | "grilled" | "mixed";

/** Portion size derived from total weight or AI detection */
export type PortionSize = "small" | "medium" | "large";

/** Image quality assessment from AI */
export type ImageQuality = "good" | "insufficient";

/** Oil level in visual analysis */
export type OilLevel = "low" | "medium" | "high";

// ---- Phase 1: Vision Detection (strict JSON format from AI) ----

/** Single ingredient detected by vision AI */
export interface DetectedIngredient {
  name: string;
  estimated_quantity_grams: number;
  confidence: number; // 0-100
}

/** Visual properties detected by AI for caloric adjustment */
export interface VisualProperties {
  oil_level: OilLevel;
  sauce_presence: boolean;
  fried_elements: boolean;
  grilled_elements: boolean;
}

/** Raw output from the vision API (Phase 1) — strict JSON-only format */
export interface VisionDetectionResult {
  image_quality: ImageQuality;
  dish_name: string | null;         // null if confidence < 60
  confidence: number;               // 0-100
  country_guess: string | null;     // Senegal, Cote d'Ivoire, Cameroun, Mali, Nigeria, etc.
  ingredients: DetectedIngredient[];
  visual_properties: VisualProperties;
  portion_size: PortionSize;
  plate_fill_percentage: number;    // 0-100
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
  match_type: "exact" | "fuzzy" | "learned" | "category_fallback" | "approximate_estimation";
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

// ---- Learning System ----

/** A stored correction for the learning system */
export interface ScanCorrection {
  id: string;
  user_id: string;
  scan_id: string | null;
  original_detected_dish_name: string | null;
  corrected_dish_name: string;
  original_ingredients_json: DetectedIngredient[];
  corrected_ingredients_json: MatchedIngredient[];
  image_hash: string | null;
  created_at: string;
}

/** Learning boost result from correction patterns */
export interface LearningBoost {
  suggested_dish_name: string | null;
  ingredient_adjustments: Record<string, { boost_weight_g: number; correction_count: number }>;
  correction_count: number;
  confidence_boost: number; // 0-0.15 — added to match confidence
}

// ---- Pipeline Result ----

/** Complete result of the scan pipeline */
export interface ScanPipelineResult {
  // Detection
  detected_meal_name: string;
  portion_size: PortionSize;

  // Visual properties from AI
  visual_properties: VisualProperties;
  country_guess: string | null;
  plate_fill_percentage: number;

  // Matched ingredients with nutrition
  ingredients: MatchedIngredient[];

  // Aggregated nutrition
  nutrition: NutritionResult;

  // Coherence
  warnings: CoherenceWarning[];

  // Learning
  learning_applied: boolean;

  // Meta
  confidence_score: number;
  detection_raw: VisionDetectionResult;
}
