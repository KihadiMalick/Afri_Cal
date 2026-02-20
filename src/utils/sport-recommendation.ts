/**
 * Sport recommendation engine
 * Génère des recommandations sportives basées sur le surplus calorique
 * Conversion : 100 kcal surplus = 2 km marche, 15 min course, 1500 pas
 */

export interface SportRecommendation {
  walkingKm: number;
  runningMinutes: number;
  steps: number;
  surplus: number;
}

/**
 * Génère des recommandations sportives pour compenser un surplus calorique
 * @param surplus - surplus calorique en kcal (positif = trop mangé)
 * @returns recommandations sportives ou null si pas de surplus
 */
export function generateSportRecommendation(
  surplus: number
): SportRecommendation | null {
  if (surplus <= 0) return null;

  // Conversion : 100 kcal = 2 km marche, 15 min course, 1500 pas
  const ratio = surplus / 100;

  return {
    walkingKm: Math.round(ratio * 2 * 10) / 10,
    runningMinutes: Math.round(ratio * 15),
    steps: Math.round(ratio * 1500),
    surplus: Math.round(surplus),
  };
}
