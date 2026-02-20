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
