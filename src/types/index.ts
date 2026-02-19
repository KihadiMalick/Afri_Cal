export type {
  Database,
  UserProfile,
  Meal,
  Activity,
  DailySummary,
} from "./database";

export interface CalorieCalculation {
  bmr: number;
  tdee: number;
  deficit: number;
  dailyTarget: number;
}

export interface MealScanResult {
  name: string;
  estimatedCalories: number;
  confidence: number;
  description: string;
}
