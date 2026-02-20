/**
 * Calcule un score journalier sur 100 base sur le respect de l'objectif calorique.
 *
 * Regles :
 * - Respect parfait (balance <= 0) = 100
 * - Leger surplus (1-200 kcal) = 70
 * - Surplus moyen (201-500 kcal) = 40
 * - Gros surplus (> 500 kcal) = 20
 * - Pas de donnees = 0
 */
export function calculateDailyScore(
  consumed: number,
  burned: number,
  target: number
): number {
  if (consumed === 0 && burned === 0) return 0;

  const balance = consumed - burned - target;

  if (balance <= 0) return 100;
  if (balance <= 200) return 70;
  if (balance <= 500) return 40;
  return 20;
}

/**
 * Retourne la couleur du score
 */
export function getScoreColor(score: number): string {
  if (score >= 100) return "#10b981"; // primary green
  if (score >= 70) return "#fbbf24";  // accent gold
  if (score >= 40) return "#f59e0b";  // orange
  return "#ef4444";                    // red
}
