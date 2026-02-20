import type { SupabaseClient } from "@supabase/supabase-js";
import type { DayStatus } from "@/types";

/**
 * Recalcule et upsert le daily_summary pour un utilisateur et une date.
 * Appele apres chaque ajout/suppression de repas.
 */
export async function updateDailySummary(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
  date: string
) {
  // 1. Recuperer le total des calories du jour
  const { data: meals } = await supabase
    .from("meals")
    .select("calories")
    .eq("user_id", userId)
    .eq("date", date);

  const totalConsumed = (meals ?? []).reduce(
    (sum: number, m: { calories: number }) => sum + m.calories,
    0
  );

  // 2. Recuperer le total des calories brulees
  const { data: activities } = await supabase
    .from("activities")
    .select("calories_burned")
    .eq("user_id", userId)
    .eq("date", date);

  const totalBurned = (activities ?? []).reduce(
    (sum: number, a: { calories_burned: number }) => sum + a.calories_burned,
    0
  );

  // 3. Recuperer l'objectif calorique du profil
  const { data: profile } = await supabase
    .from("users_profile")
    .select("daily_calorie_target")
    .eq("user_id", userId)
    .single();

  const calorieTarget = profile?.daily_calorie_target ?? 2000;

  // 4. Calculer le bilan : positif = surplus, negatif = sous l'objectif
  const calorieBalance = totalConsumed - totalBurned - calorieTarget;

  // 5. Determiner le statut
  const status: DayStatus =
    calorieBalance > 0 ? "red" : calorieBalance === 0 ? "gold" : "green";

  // 6. Upsert dans daily_summary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("daily_summary")
    .upsert(
      {
        user_id: userId,
        date,
        total_calories_consumed: totalConsumed,
        total_calories_burned: totalBurned,
        calorie_target: calorieTarget,
        calorie_balance: calorieBalance,
        status,
      },
      { onConflict: "user_id,date" }
    );

  return { totalConsumed, totalBurned, calorieTarget, calorieBalance, status, error };
}
