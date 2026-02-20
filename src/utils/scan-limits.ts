import type { SupabaseClient } from "@supabase/supabase-js";

const FREE_SCAN_LIMIT = 3;

interface ScanLimitResult {
  canScan: boolean;
  scansUsed: number;
  scansRemaining: number;
  isPremium: boolean;
}

export async function checkScanLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<ScanLimitResult> {
  // Check if user is premium
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("users_profile")
    .select("is_premium")
    .eq("user_id", userId)
    .single();

  const isPremium = profile?.is_premium === true;

  if (isPremium) {
    return { canScan: true, scansUsed: 0, scansRemaining: Infinity, isPremium: true };
  }

  const today = new Date().toISOString().split("T")[0];

  // Get or create scan limits
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: limits } = await (supabase as any)
    .from("user_scan_limits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!limits) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("user_scan_limits")
      .insert({ user_id: userId, scans_today: 0, last_reset_date: today });

    return { canScan: true, scansUsed: 0, scansRemaining: FREE_SCAN_LIMIT, isPremium: false };
  }

  // Reset if new day
  if (limits.last_reset_date !== today) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("user_scan_limits")
      .update({ scans_today: 0, last_reset_date: today })
      .eq("user_id", userId);

    return { canScan: true, scansUsed: 0, scansRemaining: FREE_SCAN_LIMIT, isPremium: false };
  }

  const scansUsed = limits.scans_today;
  const scansRemaining = Math.max(0, FREE_SCAN_LIMIT - scansUsed);

  return {
    canScan: scansUsed < FREE_SCAN_LIMIT,
    scansUsed,
    scansRemaining,
    isPremium: false,
  };
}

export async function incrementScanCount(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: limits } = await (supabase as any)
    .from("user_scan_limits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!limits) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("user_scan_limits")
      .insert({ user_id: userId, scans_today: 1, last_reset_date: today });
  } else if (limits.last_reset_date !== today) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("user_scan_limits")
      .update({ scans_today: 1, last_reset_date: today })
      .eq("user_id", userId);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("user_scan_limits")
      .update({ scans_today: limits.scans_today + 1 })
      .eq("user_id", userId);
  }
}
