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
  if (score >= 100) return "#D98E4F";
  if (score >= 70) return "#E4C06E";
  if (score >= 40) return "#B8723A";
  return "#ef4444";
}
