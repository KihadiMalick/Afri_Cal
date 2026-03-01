export type {
  Database,
  UserProfile,
  Meal,
  Activity,
  DailySummary,
  DayStatus,
  WeightLog,
  AfricanFood,
  ScanHistory,
  ScanCorrection,
  UserScanLimit,
} from "./database";

export type {
  TextureType,
  PortionSize,
  DetectedIngredient,
  VisionDetectionResult,
  EstimatedIngredient,
  MatchedIngredient,
  NutritionResult,
  IngredientNutrition,
  CoherenceWarning,
  ScanPipelineResult,
} from "./vision-pipeline";

export interface CalorieCalculation {
  bmr: number;
  tdee: number;
  deficit: number;
  dailyTarget: number;
}

/** @deprecated Use ScanPipelineResult from vision-pipeline instead */
export interface ScanResult {
  dish_name: string;
  ingredients: string[];
  estimated_weight_grams: number;
  estimated_calories: number;
  confidence: number;
  matched_african_dish?: string;
  adjusted_calories?: number;
}

export interface Badge {
  id: string;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  days: number;
  icon: string;
  unlocked: boolean;
}
