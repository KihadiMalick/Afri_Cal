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

/** Navigation param list for type-safe navigation */
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Activities: undefined;
  Calendar: undefined;
  Profile: undefined;
};

export type MealsStackParamList = {
  MealsList: undefined;
  Scan: { imageUri?: string; imageBase64?: string };
  AddMeal: undefined;
  MealHistory: undefined;
  Recipes: undefined;
};

export type ActivitiesStackParamList = {
  ActivitiesList: undefined;
  ActivityDetail: { sport: SportActivity };
};

export interface SportActivity {
  id: string;
  name: string;
  name_fr: string;
  image_url: string;
  calories_per_5min: number;
  difficulty: 'easy' | 'medium' | 'intense';
  benefits: string[];
  muscle_groups: string[];
  description: string;
  description_fr: string;
}
