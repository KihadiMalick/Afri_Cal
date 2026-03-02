import { ACTIVITY_MULTIPLIERS } from "./constants";

export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female"
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(gender === "male" ? base + 5 : base - 161);
}

export function calculateTDEE(
  bmr: number,
  activityLevel: "sedentary" | "light" | "moderate" | "active"
): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calculateDeficit(
  targetWeightLoss: number,
  targetMonths: number
): number {
  if (targetWeightLoss <= 0 || targetMonths <= 0) return 0;
  const totalCaloriesToLose = targetWeightLoss * 7700;
  const totalDays = targetMonths * 30;
  return Math.round(totalCaloriesToLose / totalDays);
}

export function calculateDailyTarget(
  tdee: number,
  goal: "lose" | "maintain" | "gain",
  deficit: number
): number {
  switch (goal) {
    case "lose":
      return Math.max(1200, Math.round(tdee - deficit));
    case "gain":
      return Math.round(tdee + 500);
    case "maintain":
    default:
      return Math.round(tdee);
  }
}

export function getCalorieCalculation(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female",
  activityLevel: "sedentary" | "light" | "moderate" | "active",
  goal: "lose" | "maintain" | "gain",
  targetWeightLoss: number,
  targetMonths: number
) {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const deficit = calculateDeficit(targetWeightLoss, targetMonths);
  const dailyTarget = calculateDailyTarget(tdee, goal, deficit);
  return { bmr, tdee, deficit, dailyTarget };
}
