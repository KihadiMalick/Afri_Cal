import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Calcule le nombre de jours consecutifs avec status = "green"
 * en partant d'aujourd'hui vers le passe.
 */
export async function calculateGreenStreak(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string
): Promise<number> {
  // Fetch last 90 days of summaries ordered by date descending
  const today = new Date();
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data } = await supabase
    .from("daily_summary")
    .select("date, status")
    .eq("user_id", userId)
    .gte("date", ninetyDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: false });

  if (!data || data.length === 0) return 0;

  let streak = 0;
  const todayStr = today.toISOString().split("T")[0];

  // Build a map of date -> status
  const statusMap = new Map<string, string>();
  for (const d of data) {
    statusMap.set(d.date, d.status);
  }

  // Count consecutive green days from today backwards
  const checkDate = new Date(today);
  for (let i = 0; i < 90; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const status = statusMap.get(dateStr);

    // Skip today if no entry yet
    if (i === 0 && !status && dateStr === todayStr) {
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }

    if (status === "green") {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
