export interface SportRecommendation {
  walkingKm: number;
  runningMinutes: number;
  steps: number;
  surplus: number;
}

export function generateSportRecommendation(
  surplus: number
): SportRecommendation | null {
  if (surplus <= 0) return null;
  const ratio = surplus / 100;
  return {
    walkingKm: Math.round(ratio * 2 * 10) / 10,
    runningMinutes: Math.round(ratio * 15),
    steps: Math.round(ratio * 1500),
    surplus: Math.round(surplus),
  };
}
