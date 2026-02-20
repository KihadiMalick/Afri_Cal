import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Calcule la projection de poids dans 30 jours.
 * Formule : 7700 kcal = 1 kg
 * On utilise le surplus/deficit cumule des 30 derniers jours pour projeter.
 */
export async function calculateWeightProjection(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
  currentWeight: number
): Promise<{ projectedWeight: number; weightChange: number; avgDailyBalance: number }> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data } = await supabase
    .from("daily_summary")
    .select("calorie_balance")
    .eq("user_id", userId)
    .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

  if (!data || data.length === 0) {
    return { projectedWeight: currentWeight, weightChange: 0, avgDailyBalance: 0 };
  }

  // Sum of calorie_balance (positive = surplus, negative = deficit)
  const totalBalance = data.reduce(
    (sum: number, d: { calorie_balance: number }) => sum + d.calorie_balance,
    0
  );

  const avgDailyBalance = Math.round(totalBalance / data.length);

  // Project: 30 days * avgDailyBalance / 7700 kcal per kg
  const projectedChange = (avgDailyBalance * 30) / 7700;
  const weightChange = Math.round(projectedChange * 10) / 10;
  const projectedWeight = Math.round((currentWeight + projectedChange) * 10) / 10;

  return { projectedWeight, weightChange, avgDailyBalance };
}
