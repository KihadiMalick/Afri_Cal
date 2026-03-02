// ============================================================
// Vision Pipeline Types — LIXUM Mobile
// ============================================================

export type TextureType = "oily" | "dry" | "saucy" | "fried" | "grilled" | "mixed";
export type PortionSize = "small" | "medium" | "large";
export type ImageQuality = "good" | "insufficient";
export type OilLevel = "low" | "medium" | "high";

// ---- Phase 1: Vision Detection ----

export interface DetectedIngredient {
  name: string;
  estimated_quantity_grams: number;
  confidence: number;
}

export interface VisualProperties {
  oil_level: OilLevel;
  sauce_presence: boolean;
  fried_elements: boolean;
  grilled_elements: boolean;
}

export interface VisionDetectionResult {
  image_quality: ImageQuality;
  dish_name: string | null;
  confidence: number;
  country_guess: string | null;
  ingredients: DetectedIngredient[];
  visual_properties: VisualProperties;
  portion_size: PortionSize;
  plate_fill_percentage: number;
}

// ---- Phase 2: Portion Estimation ----

export interface EstimatedIngredient {
  normalized_name: string;
  original_name: string;
  estimated_weight_grams: number;
  texture_type: TextureType;
  confidence: number;
}

// ---- Phase 3: Database Matching ----

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

export interface CoherenceWarning {
  type: "too_low" | "too_high" | "missing_oil" | "recalculated";
  message: string;
  severity: "info" | "warning" | "error";
}

// ---- Learning System ----

export interface LearningBoost {
  suggested_dish_name: string | null;
  ingredient_adjustments: Record<string, { boost_weight_g: number; correction_count: number }>;
  correction_count: number;
  confidence_boost: number;
}

// ---- Pipeline Result ----

export interface ScanPipelineResult {
  detected_meal_name: string;
  portion_size: PortionSize;
  visual_properties: VisualProperties;
  country_guess: string | null;
  plate_fill_percentage: number;
  ingredients: MatchedIngredient[];
  nutrition: NutritionResult;
  warnings: CoherenceWarning[];
  learning_applied: boolean;
  confidence_score: number;
  detection_raw: VisionDetectionResult;
}
