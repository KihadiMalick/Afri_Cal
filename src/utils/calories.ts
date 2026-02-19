/**
 * Calorie calculation engine - Mifflin-St Jeor formula
 */

import { ACTIVITY_MULTIPLIERS } from "./constants";

/**
 * Calcule le BMR (Basal Metabolic Rate) avec la formule Mifflin-St Jeor
 * Homme : BMR = 10 * poids + 6.25 * taille - 5 * age + 5
 * Femme : BMR = 10 * poids + 6.25 * taille - 5 * age - 161
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female"
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(gender === "male" ? base + 5 : base - 161);
}

/**
 * Calcule le TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR * facteur d'activite
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: "sedentary" | "light" | "moderate" | "active"
): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calcule le deficit calorique journalier base sur l'objectif de perte de poids
 * 1 kg de graisse = environ 7700 kcal
 * deficit_par_jour = (poids_a_perdre * 7700) / (nombre_de_mois * 30)
 */
export function calculateDeficit(
  targetWeightLoss: number,
  targetMonths: number
): number {
  if (targetWeightLoss <= 0 || targetMonths <= 0) return 0;
  const totalCaloriesToLose = targetWeightLoss * 7700;
  const totalDays = targetMonths * 30;
  return Math.round(totalCaloriesToLose / totalDays);
}

/**
 * Calcule les calories journalieres autorisees
 * - "lose"     : TDEE - deficit (minimum 1200 kcal pour la sante)
 * - "maintain" : TDEE
 * - "gain"     : TDEE + 500
 */
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

/**
 * Pipeline complet : retourne BMR, TDEE, deficit et objectif calorique
 */
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
