import type { SupabaseClient } from "@supabase/supabase-js";

export async function calculateGreenStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
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

  const statusMap = new Map<string, string>();
  for (const d of data) {
    statusMap.set(d.date, d.status);
  }

  const checkDate = new Date(today);
  for (let i = 0; i < 90; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const status = statusMap.get(dateStr);

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
