import type { SupabaseClient } from "@supabase/supabase-js";
import type { DayStatus } from "@/types";

export async function updateDailySummary(
  supabase: SupabaseClient,
  userId: string,
  date: string
) {
  const { data: meals } = await supabase
    .from("meals")
    .select("calories")
    .eq("user_id", userId)
    .eq("date", date);

  const totalConsumed = (meals ?? []).reduce(
    (sum: number, m: { calories: number }) => sum + m.calories,
    0
  );

  const { data: activities } = await supabase
    .from("activities")
    .select("calories_burned")
    .eq("user_id", userId)
    .eq("date", date);

  const totalBurned = (activities ?? []).reduce(
    (sum: number, a: { calories_burned: number }) => sum + a.calories_burned,
    0
  );

  const { data: profile } = await supabase
    .from("users_profile")
    .select("daily_calorie_target")
    .eq("user_id", userId)
    .single();

  const calorieTarget = profile?.daily_calorie_target ?? 2000;
  const calorieBalance = totalConsumed - totalBurned - calorieTarget;

  const status: DayStatus =
    calorieBalance > 0 ? "red" : calorieBalance === 0 ? "gold" : "green";

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
