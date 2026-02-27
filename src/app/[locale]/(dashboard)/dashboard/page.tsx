"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getDictionary, isValidLocale } from "@/i18n";
import { generateSportRecommendation } from "@/utils/sport-recommendation";
import { calculateDailyScore } from "@/utils/daily-score";
import { calculateGreenStreak } from "@/utils/streak";
import { calculateWeightProjection } from "@/utils/weight-projection";
import { getBadges } from "@/utils/badges";
import type { UserProfile, Meal, Badge } from "@/types";

/* ──────────────────────────────────────────────
   LIXUM — Sidebar navigation items
   ────────────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: "🏠", labelFr: "Accueil", labelEn: "Home",       path: "dashboard"  },
  { icon: "🍜", labelFr: "Repas",   labelEn: "Meals",      path: "meals"      },
  { icon: "🏃", labelFr: "Activités", labelEn: "Activity", path: "activities" },
  { icon: "📅", labelFr: "Agenda",  labelEn: "Calendar",   path: "calendar"   },
  { icon: "👤", labelFr: "Profil",  labelEn: "Profile",    path: "profile"    },
];

/* Dark wood SVG pattern + deep obsidian gradient for sidebar */
const SIDEBAR_BG = `
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E
    %3Cline x1='0' y1='0' x2='100' y2='100' stroke='rgba(60,30,10,0.18)' stroke-width='0.6'/%3E
    %3Cline x1='20' y1='0' x2='120' y2='100' stroke='rgba(60,30,10,0.12)' stroke-width='0.5'/%3E
    %3Cline x1='40' y1='0' x2='140' y2='100' stroke='rgba(80,40,15,0.09)' stroke-width='0.5'/%3E
    %3Cline x1='60' y1='0' x2='160' y2='100' stroke='rgba(60,30,10,0.07)' stroke-width='0.4'/%3E
  %3C/svg%3E"),
  linear-gradient(180deg, #1e0f07 0%, #130a04 50%, #1a0d06 100%)
`.replace(/\n\s+/g, "");

/* ══════════════════════════════════════════════
   LIXUM DASHBOARD PAGE
   ══════════════════════════════════════════════ */
export default function DashboardPage() {
  const params   = useParams();
  const router   = useRouter();
  const pathname = usePathname();
  const locale   = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const t        = getDictionary(locale);
  const supabase = createClient();

  /* ─── State ─────────────────────────────────── */
  const [profile,            setProfile]           = useState<UserProfile | null>(null);
  const [loading,            setLoading]           = useState(true);
  const [userEmail,          setUserEmail]         = useState("");
  const [todayConsumed,      setTodayConsumed]     = useState(0);
  const [todayBurned,        setTodayBurned]       = useState(0);
  const [todayMeals,         setTodayMeals]        = useState<Meal[]>([]);
  const [dailyScore,         setDailyScore]        = useState(0);
  const [streak,             setStreak]            = useState(0);
  const [badges,             setBadges]            = useState<Badge[]>([]);
  const [projectedWeight,    setProjectedWeight]   = useState(0);
  const [weightChange,       setWeightChange]      = useState(0);
  const [caloriesChartData,  setCaloriesChartData] = useState<{ date: string; consumed: number; target: number }[]>([]);

  /* ─── Data loading ───────────────────────────── */
  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push(`/${locale}/login`); return; }

    setUserEmail(user.email || "");
    const todayStr = new Date().toISOString().split("T")[0];

    const { data: profileData } = await supabase
      .from("users_profile").select("*").eq("user_id", user.id).single();
    if (profileData) setProfile(profileData as UserProfile);

    const { data: mealsData } = await supabase
      .from("meals").select("*").eq("user_id", user.id).eq("date", todayStr)
      .order("created_at", { ascending: true });
    const meals = (mealsData as Meal[]) ?? [];
    setTodayMeals(meals);
    const consumed = meals.reduce((s, m) => s + m.calories, 0);
    setTodayConsumed(consumed);

    const { data: actData } = await supabase
      .from("activities").select("calories_burned").eq("user_id", user.id).eq("date", todayStr);
    const burned = (actData ?? []).reduce(
      (s: number, a: { calories_burned: number }) => s + a.calories_burned, 0
    );
    setTodayBurned(burned);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target = (profileData as any)?.daily_calorie_target ?? 2000;
    setDailyScore(calculateDailyScore(consumed, burned, target));

    const s = await calculateGreenStreak(supabase, user.id);
    setStreak(s);
    setBadges(getBadges(s));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentWeight = (profileData as any)?.weight ?? 70;
    const proj = await calculateWeightProjection(supabase, user.id, currentWeight);
    setProjectedWeight(proj.projectedWeight);
    setWeightChange(proj.weightChange);

    const thirtyAgo = new Date();
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: summaries } = await (supabase as any)
      .from("daily_summary")
      .select("date, total_calories_consumed, calorie_target")
      .eq("user_id", user.id)
      .gte("date", thirtyAgo.toISOString().split("T")[0])
      .order("date", { ascending: true });
    setCaloriesChartData(
      (summaries ?? []).map((r: { date: string; total_calories_consumed: number; calorie_target: number }) => ({
        date: r.date, consumed: r.total_calories_consumed, target: r.calorie_target,
      }))
    );

    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
    router.refresh();
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Loading screen (LIXUM style) ──────────── */
  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#080604] flex flex-col items-center justify-center gap-5">
        <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-black text-lg shadow-[0_0_28px_rgba(245,158,11,0.6)] animate-pulse">
          LX
        </div>
        <div className="w-7 h-7 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  /* ─── Onboarding gate (LIXUM style) ─────────── */
  if (!profile || !profile.onboarding_completed) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#080604] flex flex-col items-center justify-center gap-6 p-8 text-white">
        <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-black text-lg shadow-[0_0_24px_rgba(245,158,11,0.5)]">
          LX
        </div>
        <h1 className="text-3xl font-black tracking-[0.15em]">
          LI<span className="text-amber-500">X</span>UM
        </h1>
        <p className="text-white/50 text-center max-w-xs">{t.dashboard.completeOnboarding}</p>
        <Link
          href={`/${locale}/onboarding`}
          className="bg-amber-500 text-black font-black px-8 py-3 rounded-2xl hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.4)]"
        >
          {t.dashboard.goToOnboarding}
        </Link>
      </div>
    );
  }

  /* ─── Derived values ─────────────────────────── */
  const remaining       = profile.daily_calorie_target - todayConsumed + todayBurned;
  const surplus         = todayConsumed - todayBurned - profile.daily_calorie_target;
  const recommendation  = generateSportRecommendation(surplus);
  const progressPercent = Math.min(100, Math.round((todayConsumed / profile.daily_calorie_target) * 100));
  const displayName     = profile.full_name || userEmail.split("@")[0];

  /* ══════════════════════════════════════════════
     RENDER — Full-screen LIXUM overlay
     z-[60] ensures it covers the standard Navbar
     ══════════════════════════════════════════════ */
  return (
    <div className="fixed inset-0 z-[60] bg-[#080604] text-white flex overflow-hidden" style={{ fontFamily: "Nunito, sans-serif" }}>

      {/* ════════════ SIDEBAR (desktop) ════════════ */}
      <aside
        className="hidden md:flex w-[5.5rem] flex-col items-center py-8 flex-shrink-0"
        style={{
          borderRadius: "0 36px 36px 0",
          backgroundImage: SIDEBAR_BG,
          borderRight: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "4px 0 28px rgba(0,0,0,0.55), inset -1px 0 0 rgba(255,255,255,0.025)",
        }}
      >
        {/* Logo mark */}
        <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center font-black text-black text-sm shadow-[0_0_24px_rgba(245,158,11,0.55),inset_0_1px_0_rgba(255,255,255,0.3)] mb-1 select-none">
          LX
        </div>
        <p className="text-[6px] text-amber-500/50 uppercase font-black tracking-[0.3em] mb-8">lixum</p>

        {/* Nav links */}
        <nav className="flex flex-col items-center gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.includes(`/${item.path}`);
            return (
              <Link
                key={item.path}
                href={`/${locale}/${item.path}`}
                className={`relative flex flex-col items-center gap-1 w-[3.5rem] py-3 rounded-2xl transition-all duration-200 ${
                  isActive ? "text-amber-500" : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: "rgba(10,5,2,0.65)",
                        boxShadow:
                          "inset 0 2px 6px rgba(0,0,0,0.55), inset 0 1px 2px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.035)",
                      }
                    : undefined
                }
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                )}
                <span className="text-[1.2rem] leading-none">{item.icon}</span>
                <span className="text-[6.5px] uppercase font-black tracking-widest">
                  {locale === "fr" ? item.labelFr : item.labelEn}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-white/20 hover:text-red-400 transition-colors mt-4 py-2"
        >
          <span className="text-[1.1rem]">🚪</span>
          <span className="text-[6.5px] uppercase font-black tracking-widest">
            {locale === "fr" ? "Sortir" : "Exit"}
          </span>
        </button>
      </aside>

      {/* ════════════ MAIN CONTENT ════════════ */}
      <main className="flex-1 overflow-y-auto relative">

        {/* Ambient glow blobs */}
        <div className="pointer-events-none fixed top-[-8%] left-[10%] w-80 h-80 bg-orange-600 rounded-full blur-[110px] opacity-[0.07]" />
        <div className="pointer-events-none fixed bottom-[-12%] right-[-4%] w-64 h-64 bg-amber-500 rounded-full blur-[130px] opacity-[0.04]" />

        <div className="flex flex-col items-center px-4 pt-5 pb-28 md:px-8 md:pt-8 md:pb-10 min-h-full">

          {/* ─── HEADER ─── */}
          <header className="w-full max-w-3xl flex justify-between items-center mb-8 z-10">
            <div>
              <h1 className="text-2xl font-black tracking-[0.18em] leading-none">
                LI<span className="text-amber-500">X</span>UM
              </h1>
              <p className="text-[8px] text-amber-500/55 uppercase tracking-[0.38em] font-black mt-0.5">
                Bio-Digital Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-white/35 font-semibold">{displayName}</span>
              <div className="relative bg-white/[0.05] p-2.5 rounded-2xl border border-white/[0.08] backdrop-blur-sm cursor-pointer hover:bg-white/[0.09] transition-colors">
                <span className="text-lg">🔔</span>
              </div>
            </div>
          </header>

          {/* ─── VITALITY CARD ─── */}
          <section className="w-full max-w-3xl z-10 mb-5">
            <div
              className="relative overflow-hidden rounded-[2.5rem] p-7 md:p-10 shadow-2xl group"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.018) 100%)",
                backdropFilter: "blur(28px)",
                border: "1px solid rgba(255,255,255,0.075)",
              }}
            >
              {/* Hover shimmer */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-amber-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Top row — score + goals */}
              <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-7">
                <div className="space-y-1">
                  <span className="text-[9px] text-amber-500/80 font-black uppercase tracking-[0.22em]">
                    {locale === "fr" ? "Score de Vitalité" : "Vitality Score"}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black tracking-tighter italic leading-none">{dailyScore}</span>
                    <span className="text-2xl font-black text-amber-500">%</span>
                  </div>
                  <p className="text-[10px] text-white/30 font-semibold">{displayName}</p>
                </div>

                <div className="flex gap-5 sm:gap-7">
                  <div className="text-right">
                    <p className="text-[8px] text-white/30 font-black uppercase tracking-wider mb-1">
                      {locale === "fr" ? "Objectif" : "Goal"}
                    </p>
                    <p className="text-lg font-black italic">
                      {profile.daily_calorie_target.toLocaleString()}
                      <span className="text-xs font-normal text-white/30"> kcal</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-white/30 font-black uppercase tracking-wider mb-1">
                      {locale === "fr" ? "Consommé" : "Consumed"}
                    </p>
                    <p className="text-lg font-black italic text-amber-400">
                      {todayConsumed.toLocaleString()}
                      <span className="text-xs font-normal text-white/30"> kcal</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-3 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.04] mb-7">
                <div
                  className="h-full rounded-full shadow-[0_0_18px_rgba(245,158,11,0.45)] transition-all duration-1000"
                  style={{
                    width: `${progressPercent}%`,
                    background: "linear-gradient(90deg, #ea580c 0%, #f59e0b 55%, #eab308 100%)",
                  }}
                />
              </div>

              {/* Stats row */}
              <div className="relative grid grid-cols-4 gap-2 border-t border-white/[0.07] pt-6">
                {[
                  {
                    label: locale === "fr" ? "Brûlés"  : "Burned",
                    value: todayBurned,
                    unit: "kcal",
                    color: "text-blue-400",
                  },
                  {
                    label: locale === "fr" ? "Restants" : "Left",
                    value: remaining,
                    unit: "kcal",
                    color: remaining >= 0 ? "text-green-400" : "text-red-400",
                  },
                  {
                    label: "BMR",
                    value: Math.round(profile.bmr),
                    unit: "kcal",
                    color: "text-white/80",
                  },
                  {
                    label: locale === "fr" ? "Série" : "Streak",
                    value: streak,
                    unit: locale === "fr" ? "jours" : "days",
                    color: "text-amber-500",
                  },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={`text-center ${i < 3 ? "border-r border-white/[0.07]" : ""}`}
                  >
                    <p className="text-[7.5px] text-white/30 uppercase font-black tracking-wider mb-1">{stat.label}</p>
                    <p className={`font-black text-base leading-none ${stat.color}`}>{stat.value}</p>
                    <p className="text-[7.5px] text-white/20 mt-0.5">{stat.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── SECONDARY WIDGETS GRID ─── */}
          <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 z-10">

            {/* Today's Meals */}
            <div
              className="rounded-[2rem] p-5 flex flex-col min-h-[12rem]"
              style={{ background: "rgba(255,255,255,0.022)", border: "1px solid rgba(255,255,255,0.055)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest italic">
                  {locale === "fr" ? "Repas du Jour" : "Today's Meals"}
                </span>
                <Link
                  href={`/${locale}/meals`}
                  className="text-[8px] text-white/25 hover:text-white/55 transition-colors uppercase font-black tracking-wider"
                >
                  {locale === "fr" ? "Tout voir" : "See all"} →
                </Link>
              </div>

              {todayMeals.length === 0 ? (
                <p className="text-white/25 text-xs py-5 text-center flex-1">
                  {locale === "fr" ? "Aucun repas enregistré" : "No meals logged yet"}
                </p>
              ) : (
                <div className="flex-1 space-y-1.5">
                  {todayMeals.slice(0, 4).map((meal: Meal) => (
                    <div
                      key={meal.id}
                      className="flex justify-between items-center text-xs py-1.5 border-b border-white/[0.05] last:border-0"
                    >
                      <span className="text-white/60 font-semibold truncate mr-2">{meal.name}</span>
                      <span className="text-amber-500/90 font-black flex-shrink-0 tabular-nums">
                        {meal.calories} kcal
                      </span>
                    </div>
                  ))}
                  {todayMeals.length > 4 && (
                    <p className="text-[8px] text-white/20 text-center pt-1">
                      +{todayMeals.length - 4} {locale === "fr" ? "autres" : "more"}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-auto pt-3 border-t border-white/[0.05]">
                <Link
                  href={`/${locale}/meals/scan`}
                  className="text-[9px] text-amber-500 hover:text-amber-400 font-black uppercase tracking-wider transition-colors"
                >
                  + {locale === "fr" ? "Scanner un aliment" : "Scan food"}
                </Link>
              </div>
            </div>

            {/* Activity — 7-day bar chart */}
            <div
              className="rounded-[2rem] p-5 flex flex-col overflow-hidden min-h-[12rem]"
              style={{ background: "rgba(255,255,255,0.022)", border: "1px solid rgba(255,255,255,0.055)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest italic">
                  {locale === "fr" ? "Activité" : "Activity"}
                </span>
                <Link
                  href={`/${locale}/activities`}
                  className="text-[8px] text-white/25 hover:text-white/55 transition-colors uppercase font-black tracking-wider"
                >
                  {locale === "fr" ? "Voir" : "View"} →
                </Link>
              </div>

              <div className="text-3xl font-black leading-none">
                {todayBurned}
                <span className="text-sm font-normal text-white/30 ml-1.5">kcal</span>
              </div>
              <p className="text-[8.5px] text-white/30 mt-1">
                {locale === "fr" ? "brûlées aujourd'hui" : "burned today"}
              </p>

              {/* Mini bar chart (last 7 days calorie data) */}
              <div className="flex items-end gap-1.5 h-14 mt-auto pt-4">
                {(() => {
                  const raw: { date?: string; consumed: number; target?: number }[] = caloriesChartData.length > 0 ? caloriesChartData.slice(-7) : Array(7).fill({ consumed: 0 });
                  const maxV  = Math.max(...raw.map((d) => d.consumed || 0), 1);
                  return raw.map((d, i: number) => {
                    const hPct  = Math.max(6, Math.round(((d.consumed || 0) / maxV) * 100));
                    const isLast = i === raw.length - 1;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all ${
                          isLast ? "bg-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.65)]" : "bg-white/10"
                        }`}
                        style={{ height: `${hPct}%` }}
                      />
                    );
                  });
                })()}
              </div>
            </div>

            {/* Streak + Badges */}
            <div
              className="rounded-[2rem] p-5"
              style={{ background: "rgba(255,255,255,0.022)", border: "1px solid rgba(255,255,255,0.055)" }}
            >
              <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest italic block mb-3">
                {locale === "fr" ? "Série Verte" : "Green Streak"}
              </span>

              <div className="text-3xl font-black leading-none">
                {streak}
                <span className="text-sm font-normal text-white/30 ml-1.5">
                  {locale === "fr" ? "jours" : "days"}
                </span>
              </div>

              <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-green-500 h-full rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] transition-all duration-700"
                  style={{ width: `${Math.min(100, streak * 10)}%` }}
                />
              </div>

              {badges.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {badges.slice(0, 5).map((badge: Badge) => (
                    <span
                      key={badge.id}
                      title={locale === "fr" ? badge.nameFr : badge.name}
                      className="text-xl cursor-default hover:scale-110 transition-transform inline-block"
                    >
                      {badge.icon}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Weight Projection */}
            <div
              className="rounded-[2rem] p-5"
              style={{ background: "rgba(255,255,255,0.022)", border: "1px solid rgba(255,255,255,0.055)" }}
            >
              <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest italic block mb-3">
                {locale === "fr" ? "Poids Projeté (30j)" : "Projected Weight (30d)"}
              </span>

              <div className="text-3xl font-black leading-none">
                {projectedWeight.toFixed(1)}
                <span className="text-sm font-normal text-white/30 ml-1.5">kg</span>
              </div>

              <p className="text-xs text-white/30 mt-1.5">
                {locale === "fr" ? "Actuel :" : "Current:"}{" "}
                <span className="text-white/50 font-bold">{profile.weight} kg</span>
              </p>

              <div
                className={`mt-3 inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full ${
                  weightChange > 0
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : weightChange < 0
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-white/5 text-white/40 border border-white/10"
                }`}
              >
                {weightChange > 0 ? "↑" : weightChange < 0 ? "↓" : "→"}
                {Math.abs(weightChange).toFixed(1)} kg
                <span className="font-normal opacity-60">{locale === "fr" ? " sur 30j" : " over 30d"}</span>
              </div>
            </div>
          </div>

          {/* ─── SPORT RECOMMENDATION (if surplus) ─── */}
          {recommendation && (
            <div className="w-full max-w-3xl mt-4 z-10">
              <div
                className="rounded-[2rem] p-5"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.14)" }}
              >
                <p className="text-[9px] text-red-400 font-black uppercase tracking-widest mb-4">
                  ⚡{" "}
                  {locale === "fr"
                    ? `Surplus de ${recommendation.surplus} kcal — Bougez !`
                    : `${recommendation.surplus} kcal Surplus — Move it!`}
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { value: recommendation.walkingKm,     label: locale === "fr" ? "km marche"  : "km walk"  },
                    { value: recommendation.runningMinutes, label: locale === "fr" ? "min course" : "min run"  },
                    { value: recommendation.steps,          label: locale === "fr" ? "pas"        : "steps"    },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/[0.04] rounded-2xl py-3 px-2">
                      <p className="text-lg font-black text-amber-500">{item.value}</p>
                      <p className="text-[8px] text-white/30 uppercase tracking-wide mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ════════════ MOBILE BOTTOM NAV ════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[70] flex items-center justify-around py-2"
        style={{
          background: "rgba(8,6,4,0.92)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.includes(`/${item.path}`);
          return (
            <Link
              key={item.path}
              href={`/${locale}/${item.path}`}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${
                isActive ? "text-amber-500" : "text-white/25 hover:text-white/50"
              }`}
            >
              <span className={`text-[1.1rem] ${isActive ? "drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]" : ""}`}>
                {item.icon}
              </span>
              <span className="text-[6.5px] uppercase font-black tracking-wider">
                {locale === "fr" ? item.labelFr : item.labelEn}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ════════════ MOBILE SCAN FAB ════════════ */}
      {/* Sits above the bottom nav — centered, positioned above it */}
      <div className="md:hidden fixed z-[71]" style={{ bottom: "calc(max(0.5rem, env(safe-area-inset-bottom)) + 3.5rem)", left: "50%", transform: "translateX(-50%)" }}>
        <Link href={`/${locale}/meals/scan`}>
          <button
            className="w-14 h-14 rounded-full border-[3px] border-[#080604] flex items-center justify-center text-2xl transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
              boxShadow: "0 0 24px rgba(245,158,11,0.45), 0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            📷
          </button>
        </Link>
      </div>

    </div>
  );
}
