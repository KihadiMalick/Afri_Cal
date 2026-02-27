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

/* ── Nav items ── */
const NAV_ITEMS = [
  { icon: "🏠", labelFr: "Accueil",   labelEn: "Home",       path: "dashboard"  },
  { icon: "🍜", labelFr: "Repas",     labelEn: "Meals",      path: "meals"      },
  { icon: "🏃", labelFr: "Activités", labelEn: "Activity",   path: "activities" },
  { icon: "📅", labelFr: "Agenda",    labelEn: "Calendar",   path: "calendar"   },
  { icon: "👤", labelFr: "Profil",    labelEn: "Profile",    path: "profile"    },
];

/* ── Sidebar background: deep emerald-tinted dark wood ── */
const SIDEBAR_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cline x1='0' y1='0' x2='100' y2='100' stroke='rgba(16,185,129,0.06)' stroke-width='0.6'/%3E%3Cline x1='20' y1='0' x2='120' y2='100' stroke='rgba(16,185,129,0.04)' stroke-width='0.5'/%3E%3Cline x1='40' y1='0' x2='140' y2='100' stroke='rgba(16,185,129,0.03)' stroke-width='0.4'/%3E%3C/svg%3E"), linear-gradient(180deg, #010d06 0%, #020f08 55%, #011009 100%)`;

/* ── CSS-only keyframes injected once ── */
const LIXUM_STYLES = `
  @keyframes lixum-heartbeat {
    0%,100% { transform:translate(-50%,-50%) scale(1);   opacity:.55; }
    14%     { transform:translate(-50%,-50%) scale(1.18); opacity:.90; }
    28%     { transform:translate(-50%,-50%) scale(.97);  opacity:.45; }
    42%     { transform:translate(-50%,-50%) scale(1.09); opacity:.75; }
    65%     { transform:translate(-50%,-50%) scale(1);    opacity:.55; }
  }
  @keyframes lixum-ring {
    0%,100% { transform:translate(-50%,-50%) scale(1);   opacity:.18; }
    14%     { transform:translate(-50%,-50%) scale(1.22); opacity:.32; }
    42%     { transform:translate(-50%,-50%) scale(1.12); opacity:.24; }
  }
  @keyframes lixum-fadein {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  .lixum-card {
    transition: transform .28s cubic-bezier(.25,.46,.45,.94),
                box-shadow .28s cubic-bezier(.25,.46,.45,.94),
                border-color .28s ease,
                background .28s ease;
  }
  .lixum-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 48px rgba(16,185,129,.13), 0 4px 16px rgba(0,0,0,.35);
    border-color: rgba(52,211,153,.22) !important;
    background: rgba(16,185,129,.06) !important;
  }
  .lixum-card:active {
    transform: scale(.985) translateY(-1px);
    box-shadow: 0 6px 20px rgba(16,185,129,.08);
  }
  .lixum-vitality-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 60px rgba(16,185,129,.16), 0 6px 20px rgba(0,0,0,.4);
    border-color: rgba(52,211,153,.28) !important;
  }
  .lixum-vitality-card:active {
    transform: scale(.990) translateY(-1px);
  }
  .lixum-animate { animation: lixum-fadein .45s ease-out both; }
`;

/* ══════════════════════════════════════════════════════════
   LIXUM DASHBOARD
   ══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const params   = useParams();
  const router   = useRouter();
  const pathname = usePathname();
  const locale   = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const t        = getDictionary(locale);
  const supabase = createClient();

  /* ─── State ── */
  const [profile,           setProfile]          = useState<UserProfile | null>(null);
  const [loading,           setLoading]          = useState(true);
  const [userEmail,         setUserEmail]        = useState("");
  const [todayConsumed,     setTodayConsumed]    = useState(0);
  const [todayBurned,       setTodayBurned]      = useState(0);
  const [todayMeals,        setTodayMeals]       = useState<Meal[]>([]);
  const [dailyScore,        setDailyScore]       = useState(0);
  const [streak,            setStreak]           = useState(0);
  const [badges,            setBadges]           = useState<Badge[]>([]);
  const [projectedWeight,   setProjectedWeight]  = useState(0);
  const [weightChange,      setWeightChange]     = useState(0);
  const [caloriesChartData, setCaloriesChartData]= useState<{ date: string; consumed: number; target: number }[]>([]);

  /* ─── Data loading ── */
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

  /* ─── Loading ── */
  if (loading) {
    return (
      <>
        <style>{LIXUM_STYLES}</style>
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5"
          style={{ background: "#020c07" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg animate-pulse"
            style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 0 28px rgba(16,185,129,.55)" }}>
            LX
          </div>
          <div className="w-7 h-7 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  /* ─── Onboarding gate ── */
  if (!profile || !profile.onboarding_completed) {
    return (
      <>
        <style>{LIXUM_STYLES}</style>
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 p-8 text-white"
          style={{ background: "#020c07" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg"
            style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 0 24px rgba(16,185,129,.5)" }}>
            LX
          </div>
          <h1 className="text-3xl font-black tracking-[.15em]">
            LI<span className="text-emerald-400" style={{ textShadow: "0 0 14px rgba(52,211,153,.6)" }}>X</span>UM
          </h1>
          <p className="text-white/50 text-center max-w-xs">{t.dashboard.completeOnboarding}</p>
          <Link href={`/${locale}/onboarding`}
            className="font-black px-8 py-3 rounded-2xl text-white transition-colors"
            style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 0 20px rgba(16,185,129,.4)" }}>
            {t.dashboard.goToOnboarding}
          </Link>
        </div>
      </>
    );
  }

  /* ─── Derived ── */
  const remaining       = profile.daily_calorie_target - todayConsumed + todayBurned;
  const surplus         = todayConsumed - todayBurned - profile.daily_calorie_target;
  const recommendation  = generateSportRecommendation(surplus);
  const progressPercent = Math.min(100, Math.round((todayConsumed / profile.daily_calorie_target) * 100));
  const displayName     = profile.full_name || userEmail.split("@")[0];

  /* ── Shared glass card style ── */
  const glassCard = {
    background:    "rgba(16,185,129,0.03)",
    backdropFilter:"blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border:        "1px solid rgba(52,211,153,0.1)",
    boxShadow:     "0 4px 24px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.05)",
  };

  /* ── Vitality card style (slightly more opaque) ── */
  const vitalityCard = {
    background:    "linear-gradient(135deg, rgba(255,255,255,.065) 0%, rgba(16,185,129,.04) 100%)",
    backdropFilter:"blur(28px)",
    WebkitBackdropFilter: "blur(28px)",
    border:        "1px solid rgba(52,211,153,.14)",
    boxShadow:     "0 8px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.07)",
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Inject CSS keyframes & card transitions once ── */}
      <style>{LIXUM_STYLES}</style>

      <div
        className="fixed inset-0 z-[60] text-white flex overflow-hidden"
        style={{ background: "#020c07", fontFamily: "Nunito, sans-serif" }}
      >

        {/* ════ HEARTBEAT BACKGROUND PULSE ════
            Pure CSS animation — no JS, GPU-composited (transform + opacity only).
            Two layers: inner core glow + outer expanding ring. */}
        <div aria-hidden="true" className="pointer-events-none select-none">
          {/* Core radial glow */}
          <div style={{
            position: "fixed",
            top: "50%", left: "50%",
            width: "60vmin", height: "60vmin",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,.22) 0%, rgba(16,185,129,.08) 40%, transparent 70%)",
            animation: "lixum-heartbeat 4s cubic-bezier(.36,.07,.19,.97) infinite",
            willChange: "transform, opacity",
          }} />
          {/* Expanding ring */}
          <div style={{
            position: "fixed",
            top: "50%", left: "50%",
            width: "80vmin", height: "80vmin",
            borderRadius: "50%",
            border: "1px solid rgba(52,211,153,.14)",
            animation: "lixum-ring 4s cubic-bezier(.36,.07,.19,.97) infinite",
            willChange: "transform, opacity",
          }} />
        </div>

        {/* ════ SIDEBAR ════ */}
        <aside
          className="flex flex-shrink-0 flex-col items-center pt-7 pb-6 w-14 md:w-[5.5rem]"
          style={{
            borderRadius: "0 28px 28px 0",
            backgroundImage: SIDEBAR_BG,
            borderRight: "1px solid rgba(52,211,153,.07)",
            boxShadow: "4px 0 32px rgba(0,0,0,.55), inset -1px 0 0 rgba(52,211,153,.04)",
          }}
        >
          {/* Logo */}
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm md:text-base select-none flex-shrink-0 mb-1"
            style={{
              background: "linear-gradient(135deg,#10b981,#059669)",
              boxShadow: "0 0 22px rgba(16,185,129,.52), inset 0 1px 0 rgba(255,255,255,.22)",
            }}
          >
            LX
          </div>
          <p className="text-[5.5px] md:text-[6px] text-emerald-400/45 uppercase font-black tracking-[.28em] mb-5 flex-shrink-0">
            lixum
          </p>

          {/* Nav — flex-1 so it fills all remaining vertical space */}
          <nav className="flex flex-col items-center w-full px-1 flex-1 justify-around">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.includes(`/${item.path}`);
              return (
                <Link
                  key={item.path}
                  href={`/${locale}/${item.path}`}
                  prefetch={true}
                  className={`relative flex flex-col items-center gap-1.5 w-full rounded-2xl transition-all duration-200 py-2.5 ${
                    isActive
                      ? "text-amber-400"
                      : "text-white/35 hover:text-white/70 hover:bg-white/[0.04]"
                  }`}
                  style={isActive ? {
                    backgroundColor: "rgba(2,14,8,.7)",
                    boxShadow: "inset 0 2px 8px rgba(0,0,0,.55), inset 0 1px 2px rgba(0,0,0,.4), 0 1px 0 rgba(52,211,153,.05)",
                  } : undefined}
                >
                  {/* Active bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-emerald-400"
                      style={{ boxShadow: "0 0 10px rgba(52,211,153,.8)" }} />
                  )}
                  {/* Icon — bigger to fill sidebar */}
                  <span className="text-[1.6rem] md:text-[2rem] leading-none">{item.icon}</span>
                  <span className="hidden md:block text-[6px] uppercase font-black tracking-widest opacity-80">
                    {locale === "fr" ? item.labelFr : item.labelEn}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Logout — anchored at bottom */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-white/20 hover:text-red-400 transition-all duration-200 mt-4 py-2 rounded-2xl w-full hover:bg-red-500/[0.06] flex-shrink-0"
          >
            <span className="text-[1.3rem] md:text-[1.5rem]">🚪</span>
            <span className="hidden md:block text-[6px] uppercase font-black tracking-widest">
              {locale === "fr" ? "Sortir" : "Exit"}
            </span>
          </button>
        </aside>

        {/* ════ MAIN CONTENT ════ */}
        <main className="flex-1 overflow-y-auto relative">

          {/* Subtle static ambient glow (top-left) — not animated to keep it light */}
          <div className="pointer-events-none fixed top-0 left-[15%] w-72 h-72 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,.07) 0%, transparent 70%)", filter: "blur(40px)" }} />

          <div className="flex flex-col items-center px-3 pt-5 pb-8 md:px-7 md:pt-7 min-h-full">

            {/* ── HEADER ── */}
            <header className="w-full max-w-3xl flex justify-between items-center mb-6 md:mb-8 lixum-animate">
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-[.18em] leading-none">
                  LI
                  <span className="text-emerald-400"
                    style={{ textShadow: "0 0 16px rgba(52,211,153,.65)" }}>
                    X
                  </span>
                  UM
                </h1>
                <p className="text-[7px] md:text-[8px] text-emerald-400/50 uppercase tracking-[.38em] font-black mt-0.5">
                  Bio-Digital Dashboard
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <span className="hidden sm:block text-sm text-white/35 font-semibold truncate max-w-[8rem]">
                  {displayName}
                </span>
                <div className="relative p-2 md:p-2.5 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                  style={{ ...glassCard }}>
                  <span className="text-base md:text-lg">🔔</span>
                </div>
              </div>
            </header>

            {/* ── VITALITY CARD ── */}
            <section className="w-full max-w-3xl mb-5 lixum-animate" style={{ animationDelay: ".05s" }}>
              <div className="lixum-vitality-card relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 cursor-default"
                style={vitalityCard}>
                {/* Subtle inner glow highlight */}
                <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem]"
                  style={{ background: "radial-gradient(ellipse at 20% 10%, rgba(52,211,153,.06) 0%, transparent 55%)", pointerEvents: "none" }} />

                {/* Top row */}
                <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-7">
                  <div className="space-y-1.5">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[.22em]"
                      style={{ color: "#34d399" }}>
                      {locale === "fr" ? "Score de Vitalité" : "Vitality Score"}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl md:text-7xl font-black tracking-tighter italic leading-none">
                        {dailyScore}
                      </span>
                      <span className="text-2xl md:text-3xl font-black"
                        style={{ color: "#34d399", textShadow: "0 0 16px rgba(52,211,153,.5)" }}>
                        %
                      </span>
                    </div>
                    <p className="text-[10px] md:text-xs text-white/30 font-semibold">{displayName}</p>
                  </div>

                  <div className="flex gap-5 md:gap-8">
                    <div className="text-right">
                      <p className="text-[8px] md:text-[9px] text-white/30 font-black uppercase tracking-wider mb-1">
                        {locale === "fr" ? "Objectif" : "Goal"}
                      </p>
                      <p className="text-xl md:text-2xl font-black italic text-amber-400">
                        {profile.daily_calorie_target.toLocaleString()}
                        <span className="text-xs font-normal text-white/30 ml-0.5">kcal</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] md:text-[9px] text-white/30 font-black uppercase tracking-wider mb-1">
                        {locale === "fr" ? "Consommé" : "Consumed"}
                      </p>
                      <p className="text-xl md:text-2xl font-black italic text-amber-300">
                        {todayConsumed.toLocaleString()}
                        <span className="text-xs font-normal text-white/30 ml-0.5">kcal</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-3.5 rounded-full overflow-hidden mb-7"
                  style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.04)" }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{
                    width: `${progressPercent}%`,
                    background: "linear-gradient(90deg,#ea580c,#f59e0b 55%,#eab308)",
                    boxShadow: "0 0 18px rgba(245,158,11,.45)",
                  }} />
                </div>

                {/* Stats row */}
                <div className="relative grid grid-cols-4 gap-2 pt-5 md:pt-6"
                  style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
                  {[
                    { label: locale === "fr" ? "Brûlés"   : "Burned",  value: todayBurned,           unit: "kcal", color: "#60a5fa" },
                    { label: locale === "fr" ? "Restants" : "Left",    value: remaining,             unit: "kcal", color: remaining >= 0 ? "#34d399" : "#f87171" },
                    { label: "BMR",                                     value: Math.round(profile.bmr), unit: "kcal", color: "rgba(255,255,255,.7)" },
                    { label: locale === "fr" ? "Série"    : "Streak",  value: streak,                unit: locale === "fr" ? "j" : "d", color: "#34d399" },
                  ].map((stat, i) => (
                    <div key={stat.label} className={`text-center ${i < 3 ? "border-r" : ""}`}
                      style={{ borderColor: "rgba(255,255,255,.06)" }}>
                      <p className="text-[7px] md:text-[8px] text-white/30 uppercase font-black tracking-wider mb-1.5">{stat.label}</p>
                      <p className="font-black text-base md:text-lg leading-none" style={{ color: stat.color }}>{stat.value}</p>
                      <p className="text-[7px] text-white/20 mt-0.5">{stat.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── WIDGET GRID ── */}
            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">

              {/* Meals */}
              <div className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 flex flex-col min-h-[15rem] md:min-h-[17rem] lixum-animate cursor-default"
                style={{ ...glassCard, animationDelay: ".10s" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] md:text-[10px] text-amber-500 font-black uppercase tracking-widest italic">
                    {locale === "fr" ? "Repas du Jour" : "Today's Meals"}
                  </span>
                  <Link href={`/${locale}/meals`} prefetch={true}
                    className="text-[8px] md:text-[9px] text-white/25 hover:text-emerald-400 transition-colors uppercase font-black tracking-wider">
                    {locale === "fr" ? "Tout voir" : "See all"} →
                  </Link>
                </div>

                {todayMeals.length === 0 ? (
                  <p className="text-white/25 text-sm py-6 text-center flex-1">
                    {locale === "fr" ? "Aucun repas enregistré" : "No meals logged yet"}
                  </p>
                ) : (
                  <div className="flex-1 space-y-2">
                    {todayMeals.slice(0, 5).map((meal: Meal) => (
                      <div key={meal.id} className="flex justify-between items-center text-xs md:text-sm py-2"
                        style={{ borderBottom: "1px solid rgba(52,211,153,.06)" }}>
                        <span className="text-white/65 font-semibold truncate mr-2">{meal.name}</span>
                        <span className="text-amber-400/90 font-black flex-shrink-0 tabular-nums">
                          {meal.calories} kcal
                        </span>
                      </div>
                    ))}
                    {todayMeals.length > 5 && (
                      <p className="text-[8px] text-white/20 text-center pt-1">
                        +{todayMeals.length - 5} {locale === "fr" ? "autres" : "more"}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-3" style={{ borderTop: "1px solid rgba(52,211,153,.06)" }}>
                  <Link href={`/${locale}/meals`} prefetch={true}
                    className="text-[9px] md:text-[10px] text-amber-500 hover:text-amber-400 font-black uppercase tracking-wider transition-colors">
                    → {locale === "fr" ? "Gérer mes repas" : "Manage meals"}
                  </Link>
                </div>
              </div>

              {/* Activity */}
              <div className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 flex flex-col overflow-hidden min-h-[15rem] md:min-h-[17rem] lixum-animate cursor-default"
                style={{ ...glassCard, animationDelay: ".15s" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] md:text-[10px] text-amber-500 font-black uppercase tracking-widest italic">
                    {locale === "fr" ? "Activité & Énergie" : "Activity & Energy"}
                  </span>
                  <Link href={`/${locale}/activities`} prefetch={true}
                    className="text-[8px] md:text-[9px] text-white/25 hover:text-emerald-400 transition-colors uppercase font-black tracking-wider">
                    {locale === "fr" ? "Voir" : "View"} →
                  </Link>
                </div>

                <div className="text-3xl md:text-4xl font-black leading-none" style={{ color: "#60a5fa" }}>
                  {todayBurned}
                  <span className="text-sm md:text-base font-normal text-white/30 ml-1.5">kcal</span>
                </div>
                <p className="text-[8px] md:text-[9px] text-white/30 mt-1">
                  {locale === "fr" ? "brûlées aujourd'hui" : "burned today"}
                </p>

                {/* 7-day mini bar chart */}
                <div className="flex items-end gap-1.5 h-16 md:h-20 mt-auto pt-4">
                  {(() => {
                    const raw: { date?: string; consumed: number; target?: number }[] =
                      caloriesChartData.length > 0
                        ? caloriesChartData.slice(-7)
                        : Array(7).fill({ consumed: 0 });
                    const maxV = Math.max(...raw.map((d) => d.consumed || 0), 1);
                    return raw.map((d, i: number) => {
                      const hPct   = Math.max(6, Math.round(((d.consumed || 0) / maxV) * 100));
                      const isLast = i === raw.length - 1;
                      return (
                        <div key={i} className="flex-1 rounded-full transition-all" style={{
                          height: `${hPct}%`,
                          background:  isLast ? "#f59e0b" : "rgba(255,255,255,.07)",
                          boxShadow:   isLast ? "0 0 14px rgba(245,158,11,.65)" : "none",
                        }} />
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Streak & Badges — vitality → green */}
              <div className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 min-h-[12rem] lixum-animate cursor-default"
                style={{ ...glassCard, animationDelay: ".20s" }}>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic block mb-3"
                  style={{ color: "#34d399" }}>
                  {locale === "fr" ? "Série Verte — Santé" : "Green Streak — Health"}
                </span>

                <div className="text-4xl md:text-5xl font-black leading-none" style={{ color: "#34d399" }}>
                  {streak}
                  <span className="text-base md:text-lg font-normal text-white/30 ml-1.5">
                    {locale === "fr" ? "jours" : "days"}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden mt-4"
                  style={{ background: "rgba(255,255,255,.04)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${Math.min(100, streak * 10)}%`,
                    background: "linear-gradient(90deg,#059669,#34d399)",
                    boxShadow: "0 0 10px rgba(52,211,153,.5)",
                  }} />
                </div>

                {badges.length > 0 && (
                  <div className="flex gap-2.5 mt-5 flex-wrap">
                    {badges.slice(0, 5).map((badge: Badge) => (
                      <span key={badge.id}
                        title={locale === "fr" ? badge.nameFr : badge.name}
                        className="text-2xl cursor-default hover:scale-110 transition-transform inline-block">
                        {badge.icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Weight Projection — santé → green */}
              <div className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 min-h-[12rem] lixum-animate cursor-default"
                style={{ ...glassCard, animationDelay: ".25s" }}>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic block mb-3"
                  style={{ color: "#34d399" }}>
                  {locale === "fr" ? "Santé — Poids Projeté" : "Health — Projected Weight"}
                </span>

                <div className="text-4xl md:text-5xl font-black leading-none">
                  {projectedWeight.toFixed(1)}
                  <span className="text-base md:text-lg font-normal text-white/30 ml-1.5">kg</span>
                </div>

                <p className="text-xs md:text-sm text-white/30 mt-2">
                  {locale === "fr" ? "Actuel :" : "Current:"}{" "}
                  <span className="text-white/55 font-bold">{profile.weight} kg</span>
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 text-xs md:text-sm font-black px-3 py-1.5 rounded-full"
                  style={{
                    background: weightChange > 0 ? "rgba(239,68,68,.09)" : weightChange < 0 ? "rgba(16,185,129,.09)" : "rgba(255,255,255,.05)",
                    border:     `1px solid ${weightChange > 0 ? "rgba(239,68,68,.18)" : weightChange < 0 ? "rgba(52,211,153,.2)" : "rgba(255,255,255,.08)"}`,
                    color:      weightChange > 0 ? "#f87171" : weightChange < 0 ? "#34d399" : "rgba(255,255,255,.4)",
                  }}>
                  {weightChange > 0 ? "↑" : weightChange < 0 ? "↓" : "→"}
                  {" "}{Math.abs(weightChange).toFixed(1)} kg
                  <span className="font-normal opacity-60">{locale === "fr" ? " sur 30j" : " 30d"}</span>
                </div>

                <p className="text-[8px] md:text-[9px] text-white/20 mt-3 font-semibold">
                  TDEE : {Math.round(profile.tdee)} kcal/j
                </p>
              </div>
            </div>

            {/* ── SPORT RECOMMENDATION ── */}
            {recommendation && (
              <div className="w-full max-w-3xl mt-4 md:mt-5 lixum-animate" style={{ animationDelay: ".30s" }}>
                <div className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 cursor-default"
                  style={{ background: "rgba(239,68,68,.06)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(239,68,68,.14)", boxShadow: "0 4px 24px rgba(0,0,0,.28)" }}>
                  <p className="text-[9px] md:text-[10px] text-red-400 font-black uppercase tracking-widest mb-4">
                    ⚡{" "}
                    {locale === "fr"
                      ? `Surplus calorique : ${recommendation.surplus} kcal — Bougez !`
                      : `Caloric Surplus: ${recommendation.surplus} kcal — Move it!`}
                  </p>
                  <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
                    {[
                      { value: recommendation.walkingKm,     label: locale === "fr" ? "km marche"  : "km walk"  },
                      { value: recommendation.runningMinutes, label: locale === "fr" ? "min course" : "min run"  },
                      { value: recommendation.steps,          label: locale === "fr" ? "pas"        : "steps"    },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl py-3 md:py-4 px-2"
                        style={{ background: "rgba(255,255,255,.04)" }}>
                        <p className="text-xl md:text-2xl font-black text-amber-500">{item.value}</p>
                        <p className="text-[8px] md:text-[9px] text-white/30 uppercase tracking-wide mt-0.5">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}
