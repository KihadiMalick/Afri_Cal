"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getDictionary, isValidLocale } from "@/i18n";
import { generateSportRecommendation } from "@/utils/sport-recommendation";
import { calculateDailyScore } from "@/utils/daily-score";
import { calculateGreenStreak } from "@/utils/streak";
import { calculateWeightProjection } from "@/utils/weight-projection";
import { getBadges } from "@/utils/badges";
import { GLASS_CARD } from "@/components/lixum/LixumShell";
import type { UserProfile, Meal, Badge } from "@/types";

/* ══════════════════════════════════════════════════════════
   LIXUM DASHBOARD — content only (shell in layout.tsx)
   ══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const params   = useParams();
  const router   = useRouter();
  const locale   = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const t        = getDictionary(locale);
  const supabase = createClient();

  /* ── State ── */
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

  /* ── Data loading ── */
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

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center px-3 pt-5 pb-10 md:px-7 md:pt-7 min-h-full">
        <div className="w-full max-w-3xl flex justify-between items-center mb-6 md:mb-8">
          <div className="lixum-skeleton h-8 w-36 rounded-2xl" />
          <div className="lixum-skeleton h-6 w-28 rounded-xl" />
        </div>
        <div className="lixum-skeleton w-full max-w-3xl mb-5 rounded-[2rem]" style={{ height:"14rem" }} />
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {[0,1,2,3].map((i) => (
            <div key={i} className="lixum-skeleton rounded-[1.75rem]" style={{ height:"13rem" }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Onboarding gate ── */
  if (!profile || !profile.onboarding_completed) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8 py-24">
        <h1
          className="text-3xl font-black tracking-[.22em] leading-none"
          style={{ fontFamily:"'Courier New',monospace" }}
        >
          <span style={{ color:"#8b949e" }}>LI</span>
          <span className="lixum-x">X</span>
          <span style={{ color:"#8b949e" }}>UM</span>
        </h1>
        <p className="text-white/50 text-center max-w-xs text-base font-medium">{t.dashboard.completeOnboarding}</p>
        <Link
          href={`/${locale}/onboarding`}
          className="font-bold px-8 py-3 rounded-xl text-black text-sm transition-all hover:brightness-110"
          style={{ background:"#00ff9d", boxShadow:"0 0 20px rgba(0,255,157,.4)" }}
        >
          {t.dashboard.goToOnboarding}
        </Link>
      </div>
    );
  }

  /* ── Derived ── */
  const remaining       = profile.daily_calorie_target - todayConsumed + todayBurned;
  const surplus         = todayConsumed - todayBurned - profile.daily_calorie_target;
  const recommendation  = generateSportRecommendation(surplus);
  const progressPercent = Math.min(100, Math.round((todayConsumed / profile.daily_calorie_target) * 100));
  const displayName     = profile.full_name || userEmail.split("@")[0];

  /* ── Vitality card style ── */
  const vitalityCard = {
    background:          "linear-gradient(135deg, rgba(255,255,255,.06) 0%, rgba(0,255,157,.03) 100%)",
    backdropFilter:      "blur(32px)",
    WebkitBackdropFilter:"blur(32px)",
    border:              "1px solid rgba(255,255,255,0.09)",
    boxShadow:           "0 8px 48px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.07)",
  };

  /* ══════════════════════════════════════════════════════════
     RENDER — content only, shell provides the outer frame
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col items-center px-3 pt-5 pb-10 md:px-7 md:pt-7 min-h-full">

      {/* ── HEADER ── */}
      <header className="w-full max-w-3xl flex justify-between items-center mb-6 md:mb-8 lixum-animate">
        <div>
          <h1
            className="font-black tracking-[.22em] leading-none text-xl md:text-2xl"
            style={{ fontFamily:"'Courier New',monospace" }}
          >
            <span style={{ color:"#8b949e" }}>LI</span>
            <span className="lixum-x">X</span>
            <span style={{ color:"#8b949e" }}>UM</span>
          </h1>
          <p className="lixum-bio-sub text-[9px] md:text-[11px] uppercase font-semibold mt-0.5 tracking-[.32em]">
            Bio-Digital Dashboard
          </p>
        </div>
        <span className="text-base text-white/65 font-semibold truncate max-w-[12rem]">
          {displayName}
        </span>
      </header>

      {/* ── VITALITY CARD ── */}
      <section className="w-full max-w-3xl mb-5 lixum-animate" style={{ animationDelay:".05s" }}>
        <div
          className="lixum-vitality-card relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 cursor-default"
          style={vitalityCard}
        >
          {/* Corner glow */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[2rem] md:rounded-[2.5rem]"
            style={{ background:"radial-gradient(ellipse at 15% 8%, rgba(0,255,157,.05) 0%, transparent 50%)" }}
          />

          {/* Top row */}
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-7">
            <div className="space-y-2">
              <span
                className="text-xs md:text-sm font-bold uppercase tracking-[.18em]"
                style={{ color:"#00ff9d", textShadow:"0 0 10px rgba(0,255,157,.4)" }}
              >
                {locale === "fr" ? "Score de Vitalité" : "Vitality Score"}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="lixum-num text-6xl md:text-7xl font-black tracking-tighter leading-none">
                  {dailyScore}
                </span>
                <span className="lixum-x text-2xl md:text-3xl font-black">%</span>
              </div>
              <p className="text-sm text-white/60 font-medium">{displayName}</p>
            </div>

            <div className="flex gap-5 md:gap-8">
              <div className="text-right">
                <p className="text-xs text-white/60 font-bold uppercase tracking-wider mb-1">
                  {locale === "fr" ? "Objectif" : "Goal"}
                </p>
                <p className="lixum-num text-2xl md:text-3xl font-black text-amber-400">
                  {profile.daily_calorie_target.toLocaleString()}
                  <span className="text-sm font-medium text-white/50 ml-1">kcal</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60 font-bold uppercase tracking-wider mb-1">
                  {locale === "fr" ? "Consommé" : "Consumed"}
                </p>
                <p className="lixum-num text-2xl md:text-3xl font-black text-amber-300">
                  {todayConsumed.toLocaleString()}
                  <span className="text-sm font-medium text-white/50 ml-1">kcal</span>
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="relative h-3.5 rounded-full overflow-hidden mb-7"
            style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.04)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width:`${progressPercent}%`,
                background:"linear-gradient(90deg,#ea580c,#f59e0b 55%,#eab308)",
                boxShadow:"0 0 16px rgba(245,158,11,.42)",
              }}
            />
          </div>

          {/* Stats row */}
          <div
            className="relative grid grid-cols-4 gap-2 pt-5 md:pt-6"
            style={{ borderTop:"1px solid rgba(255,255,255,.06)" }}
          >
            {[
              { label: locale === "fr" ? "Calories Brûlées" : "Cal. Burned",          value: todayBurned,             unit:"kcal", color:"#60a5fa"  },
              { label: locale === "fr" ? "Restants"          : "Left",              value: remaining,               unit:"kcal", color: remaining >= 0 ? "#00ff9d" : "#f87171" },
              { label: locale === "fr" ? "Métabolisme (BMR)" : "Base Metab. (BMR)", value: Math.round(profile.bmr), unit:"kcal", color:"rgba(255,255,255,.75)" },
              { label: locale === "fr" ? "Score de Vitalité" : "Vitality Score",    value: streak,                  unit: locale === "fr" ? "j" : "d", color:"#00ff9d" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center ${i < 3 ? "border-r" : ""}`}
                style={{ borderColor:"rgba(255,255,255,.05)" }}
              >
                <p className="text-[10px] md:text-xs text-white/60 uppercase font-bold tracking-wider mb-1.5">
                  {stat.label}
                </p>
                <p className="lixum-num font-black text-4xl md:text-5xl leading-none" style={{ color:stat.color }}>
                  {stat.value}
                </p>
                <p className="text-[10px] text-white/50 mt-1">{stat.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WIDGET GRID ── */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">

        {/* Meals */}
        <div
          className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 flex flex-col min-h-[16rem] md:min-h-[17rem] lixum-animate cursor-default"
          style={{ ...GLASS_CARD, animationDelay:".10s" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-amber-400 uppercase tracking-widest">
              {locale === "fr" ? "Repas du Jour" : "Today's Meals"}
            </span>
            <Link
              href={`/${locale}/meals`}
              prefetch={true}
              className="text-xs text-white/50 hover:text-[#00ff9d] transition-colors uppercase font-bold tracking-wider"
            >
              {locale === "fr" ? "Tout voir" : "See all"} →
            </Link>
          </div>

          {todayMeals.length === 0 ? (
            <p className="text-white/55 text-base font-semibold py-6 text-center flex-1">
              {locale === "fr" ? "Aucun repas enregistré" : "No meals logged yet"}
            </p>
          ) : (
            <div className="flex-1 space-y-2">
              {todayMeals.slice(0, 5).map((meal: Meal) => (
                <div
                  key={meal.id}
                  className="flex justify-between items-center py-1.5"
                  style={{ borderBottom:"1px solid rgba(0,255,157,.05)" }}
                >
                  <span className="text-sm text-white/70 font-medium truncate mr-2">{meal.name}</span>
                  <span className="lixum-num text-sm text-amber-400 font-bold flex-shrink-0">
                    {meal.calories} kcal
                  </span>
                </div>
              ))}
              {todayMeals.length > 5 && (
                <p className="text-xs text-white/35 text-center pt-1">
                  +{todayMeals.length - 5} {locale === "fr" ? "autres" : "more"}
                </p>
              )}
            </div>
          )}

          <div className="mt-auto pt-3" style={{ borderTop:"1px solid rgba(0,255,157,.05)" }}>
            <Link
              href={`/${locale}/meals`}
              prefetch={true}
              className="text-sm text-amber-400/80 hover:text-amber-400 font-bold uppercase tracking-wider transition-colors"
            >
              → {locale === "fr" ? "Gérer mes repas" : "Manage meals"}
            </Link>
          </div>
        </div>

        {/* Activity */}
        <div
          className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 flex flex-col overflow-hidden min-h-[16rem] md:min-h-[17rem] lixum-animate cursor-default"
          style={{ ...GLASS_CARD, animationDelay:".15s" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-amber-400 uppercase tracking-widest">
              {locale === "fr" ? "Activité & Énergie" : "Activity & Energy"}
            </span>
            <Link
              href={`/${locale}/activities`}
              prefetch={true}
              className="text-xs text-white/50 hover:text-[#00ff9d] transition-colors uppercase font-bold tracking-wider"
            >
              {locale === "fr" ? "Voir" : "View"} →
            </Link>
          </div>

          <div className="lixum-num text-4xl md:text-5xl font-black leading-none" style={{ color:"#60a5fa" }}>
            {todayBurned}
            <span className="text-base font-medium text-white/55 ml-1.5">kcal</span>
          </div>
          <p className="text-sm text-white/55 mt-1 font-medium">
            {locale === "fr" ? "brûlées aujourd'hui" : "burned today"}
          </p>

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
                    height:`${hPct}%`,
                    background: isLast ? "#f59e0b" : "rgba(255,255,255,.06)",
                    boxShadow:  isLast ? "0 0 14px rgba(245,158,11,.6)" : "none",
                  }} />
                );
              });
            })()}
          </div>
        </div>

        {/* Streak */}
        <div
          className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 min-h-[12rem] lixum-animate cursor-default"
          style={{ ...GLASS_CARD, animationDelay:".20s" }}
        >
          <span
            className="text-sm font-bold uppercase tracking-widest block mb-3"
            style={{ color:"#00ff9d", textShadow:"0 0 8px rgba(0,255,157,.4)" }}
          >
            {locale === "fr" ? "Série Verte — Santé" : "Green Streak — Health"}
          </span>
          <div className="lixum-num text-4xl md:text-5xl font-black leading-none" style={{ color:"#00ff9d" }}>
            {streak}
            <span className="text-lg font-medium text-white/55 ml-1.5">
              {locale === "fr" ? "jours" : "days"}
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden mt-4"
            style={{ background:"rgba(255,255,255,.04)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width:`${Math.min(100, streak * 10)}%`,
                background:"linear-gradient(90deg,#059669,#00ff9d)",
                boxShadow:"0 0 10px rgba(0,255,157,.5)",
              }}
            />
          </div>
          {badges.length > 0 && (
            <div className="flex gap-2.5 mt-5 flex-wrap">
              {badges.slice(0, 5).map((badge: Badge) => (
                <span
                  key={badge.id}
                  title={locale === "fr" ? badge.nameFr : badge.name}
                  className="text-2xl cursor-default hover:scale-110 transition-transform inline-block"
                >
                  {badge.icon}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Weight projection */}
        <div
          className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 min-h-[12rem] lixum-animate cursor-default"
          style={{ ...GLASS_CARD, animationDelay:".25s" }}
        >
          <span
            className="text-sm font-bold uppercase tracking-widest block mb-3"
            style={{ color:"#00ff9d", textShadow:"0 0 8px rgba(0,255,157,.4)" }}
          >
            {locale === "fr" ? "Santé — Poids Projeté" : "Health — Projected Weight"}
          </span>
          <div className="lixum-num text-4xl md:text-5xl font-black leading-none">
            {projectedWeight.toFixed(1)}
            <span className="text-lg font-medium text-white/55 ml-1.5">kg</span>
          </div>
          <p className="text-sm text-white/60 mt-2 font-medium">
            {locale === "fr" ? "Actuel :" : "Current:"}{" "}
            <span className="lixum-num text-white/80 font-bold">{profile.weight} kg</span>
          </p>
          <div
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl"
            style={{
              background: weightChange > 0 ? "rgba(239,68,68,.08)" : weightChange < 0 ? "rgba(0,255,157,.07)" : "rgba(255,255,255,.04)",
              border:`1px solid ${weightChange > 0 ? "rgba(239,68,68,.16)" : weightChange < 0 ? "rgba(0,255,157,.18)" : "rgba(255,255,255,.07)"}`,
              color: weightChange > 0 ? "#f87171" : weightChange < 0 ? "#00ff9d" : "rgba(255,255,255,.45)",
            }}
          >
            {weightChange > 0 ? "↑" : weightChange < 0 ? "↓" : "→"}
            <span className="lixum-num">{Math.abs(weightChange).toFixed(1)} kg</span>
            <span className="font-normal opacity-55">{locale === "fr" ? " /30j" : " /30d"}</span>
          </div>
          <p className="text-xs text-white/40 mt-3 font-medium">
            TDEE{" "}
            <span className="lixum-num" style={{ color:"rgba(255,255,255,.60)" }}>
              {Math.round(profile.tdee)}
            </span>{" "}
            kcal/j
          </p>
        </div>
      </div>

      {/* ── SPORT RECOMMENDATION ── */}
      {recommendation && (
        <div className="w-full max-w-3xl mt-4 md:mt-5 lixum-animate" style={{ animationDelay:".30s" }}>
          <div
            className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 cursor-default"
            style={{
              background:"rgba(239,68,68,.05)",
              backdropFilter:"blur(24px)",
              WebkitBackdropFilter:"blur(24px)",
              border:"1px solid rgba(239,68,68,.12)",
              boxShadow:"0 4px 24px rgba(0,0,0,.32)",
            }}
          >
            <p className="text-sm text-red-400 font-bold uppercase tracking-widest mb-4">
              ⚡{" "}
              {locale === "fr"
                ? `Surplus calorique : ${recommendation.surplus} kcal — Bougez !`
                : `Caloric Surplus: ${recommendation.surplus} kcal — Move it!`}
            </p>
            <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
              {[
                { value: recommendation.walkingKm,      label: locale === "fr" ? "km marche"  : "km walk"  },
                { value: recommendation.runningMinutes,  label: locale === "fr" ? "min course" : "min run"  },
                { value: recommendation.steps,           label: locale === "fr" ? "pas"        : "steps"    },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl py-3 md:py-4 px-2" style={{ background:"rgba(255,255,255,.04)" }}>
                  <p className="lixum-num text-2xl md:text-3xl font-black text-amber-500">{item.value}</p>
                  <p className="text-xs text-white/55 uppercase tracking-wide mt-1 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
