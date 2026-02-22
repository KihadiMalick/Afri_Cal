export interface Database {
  public: {
    Tables: {
      users_profile: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "id" | "created_at" | "updated_at" | "avatar_url" | "is_premium"> & { avatar_url?: string | null; is_premium?: boolean };
        Update: Partial<Omit<UserProfile, "id">>;
      };
      meals: {
        Row: Meal;
        Insert: Omit<Meal, "id" | "created_at" | "image_url" | "description"> & { image_url?: string | null; description?: string | null };
        Update: Partial<Omit<Meal, "id">>;
      };
      activities: {
        Row: Activity;
        Insert: Omit<Activity, "id" | "created_at">;
        Update: Partial<Omit<Activity, "id">>;
      };
      daily_summary: {
        Row: DailySummary;
        Insert: Omit<DailySummary, "id" | "created_at">;
        Update: Partial<Omit<DailySummary, "id">>;
      };
      weight_logs: {
        Row: WeightLog;
        Insert: Omit<WeightLog, "id" | "created_at">;
        Update: Partial<Omit<WeightLog, "id">>;
      };
      african_food_database: {
        Row: AfricanFood;
        Insert: Omit<AfricanFood, "id" | "created_at">;
        Update: Partial<Omit<AfricanFood, "id">>;
      };
      scan_history: {
        Row: ScanHistory;
        Insert: Omit<ScanHistory, "id" | "created_at">;
        Update: Partial<Omit<ScanHistory, "id">>;
      };
      scan_corrections: {
        Row: ScanCorrection;
        Insert: Omit<ScanCorrection, "id" | "created_at">;
        Update: Partial<Omit<ScanCorrection, "id">>;
      };
      user_scan_limits: {
        Row: UserScanLimit;
        Insert: UserScanLimit;
        Update: Partial<UserScanLimit>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      gender: "male" | "female";
      goal: "lose" | "maintain" | "gain";
      activity_level: "sedentary" | "light" | "moderate" | "active";
      meal_type: "breakfast" | "lunch" | "dinner" | "snack";
    };
  };
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  age: number;
  weight: number;
  height: number;
  gender: "male" | "female";
  goal: "lose" | "maintain" | "gain";
  activity_level: "sedentary" | "light" | "moderate" | "active";
  target_months: 1 | 2 | 3;
  target_weight_loss: number;
  daily_calorie_target: number;
  bmr: number;
  tdee: number;
  avatar_url: string | null;
  onboarding_completed: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string | null;
  date: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  name: string;
  type: string;
  duration_minutes: number;
  calories_burned: number;
  date: string;
  created_at: string;
}

export type DayStatus = "green" | "red" | "gold";

export interface DailySummary {
  id: string;
  user_id: string;
  date: string;
  total_calories_consumed: number;
  total_calories_burned: number;
  calorie_target: number;
  calorie_balance: number;
  status: DayStatus;
  created_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight: number;
  date: string;
  created_at: string;
}

export interface AfricanFood {
  id: string;
  name: string;
  country: string;
  typical_ingredients: string[];
  calories_per_100g: number;
  density_estimate: number;
  created_at: string;
}

export interface ScanHistory {
  id: string;
  user_id: string;
  image_url: string | null;
  detected_dish: string;
  estimated_calories: number;
  estimated_weight: number | null;
  confidence_score: number;
  created_at: string;
}

export interface ScanCorrection {
  id: string;
  user_id: string;
  scan_id: string | null;
  original_detected_dish_name: string | null;
  original_ingredients_json: unknown[];
  corrected_dish_name: string;
  corrected_ingredients_json: unknown[];
  image_hash: string | null;
  created_at: string;
}

export interface UserScanLimit {
  user_id: string;
  scans_today: number;
  last_reset_date: string;
}
