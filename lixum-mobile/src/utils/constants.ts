export const APP_NAME = "LIXUM";

/** React Navigation screen names */
export const SCREENS = {
  // Auth
  Login: "Login",
  Register: "Register",
  // Main tabs
  Dashboard: "Dashboard",
  Meals: "Meals",
  Activities: "Activities",
  Calendar: "Calendar",
  Profile: "Profile",
  // Meals stack
  MealsList: "MealsList",
  Scan: "Scan",
  AddMeal: "AddMeal",
  MealHistory: "MealHistory",
  // Other
  Onboarding: "Onboarding",
} as const;

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
} as const;

export const GOAL_ADJUSTMENTS = {
  lose: -500,
  maintain: 0,
  gain: 500,
} as const;

/** API base URL for vision scanning (points to Next.js backend or Edge Functions) */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
