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

export function getScoreColor(score: number): string {
  if (score >= 100) return "#00ff9d";
  if (score >= 70) return "#00e5ff";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}
