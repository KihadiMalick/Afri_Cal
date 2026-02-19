export const APP_NAME = "AfriCalo";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  callback: "/callback",
  dashboard: "/dashboard",
  onboarding: "/onboarding",
  meals: "/meals",
  mealScan: "/meals/scan",
  mealHistory: "/meals/history",
  activities: "/activities",
  calendar: "/calendar",
  profile: "/profile",
} as const;

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/onboarding",
  "/meals",
  "/activities",
  "/calendar",
  "/profile",
];

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
