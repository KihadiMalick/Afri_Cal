export type {
  Database,
  UserProfile,
  Meal,
  Activity,
  DailySummary,
  DayStatus,
  WeightLog,
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
