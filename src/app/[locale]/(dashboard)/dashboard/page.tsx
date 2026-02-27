"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home, UtensilsCrossed, Activity, CalendarDays, UserCircle, LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { getDictionary, isValidLocale } from "@/i18n";
import { generateSportRecommendation } from "@/utils/sport-recommendation";
import { calculateDailyScore } from "@/utils/daily-score";
import { calculateGreenStreak } from "@/utils/streak";
import { calculateWeightProjection } from "@/utils/weight-projection";
import { getBadges } from "@/utils/badges";
import type { UserProfile, Meal, Badge } from "@/types";

/* ── Navigation items with lucide icons ── */
const NAV_ITEMS = [
  { Icon: Home,           labelFr: "Accueil",   labelEn: "Home",     path: "dashboard"  },
  { Icon: UtensilsCrossed,labelFr: "Repas",     labelEn: "Meals",    path: "meals"      },
  { Icon: Activity,       labelFr: "Activités", labelEn: "Activity", path: "activities" },
  { Icon: CalendarDays,   labelFr: "Agenda",    labelEn: "Calendar", path: "calendar"   },
  { Icon: UserCircle,     labelFr: "Profil",    labelEn: "Profile",  path: "profile"    },
];

/* ── Circuit-board SVG tile (subtle, 5 % opacity built into strokes) ── */
const CIRCUIT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cline x1='0' y1='20' x2='80' y2='20' stroke='rgba(0,255,157,0.10)' stroke-width='0.4'/%3E%3Cline x1='0' y1='60' x2='80' y2='60' stroke='rgba(0,255,157,0.10)' stroke-width='0.4'/%3E%3Cline x1='20' y1='0' x2='20' y2='80' stroke='rgba(0,255,157,0.10)' stroke-width='0.4'/%3E%3Cline x1='60' y1='0' x2='60' y2='80' stroke='rgba(0,255,157,0.10)' stroke-width='0.4'/%3E%3Ccircle cx='20' cy='20' r='2' fill='none' stroke='rgba(0,255,157,0.16)' stroke-width='0.5'/%3E%3Ccircle cx='60' cy='20' r='2' fill='none' stroke='rgba(0,255,157,0.16)' stroke-width='0.5'/%3E%3Ccircle cx='20' cy='60' r='2' fill='none' stroke='rgba(0,255,157,0.16)' stroke-width='0.5'/%3E%3Ccircle cx='60' cy='60' r='2' fill='none' stroke='rgba(0,255,157,0.16)' stroke-width='0.5'/%3E%3Cline x1='24' y1='20' x2='36' y2='20' stroke='rgba(0,255,157,0.07)' stroke-width='0.3'/%3E%3Cline x1='44' y1='60' x2='56' y2='60' stroke='rgba(0,255,157,0.07)' stroke-width='0.3'/%3E%3Cline x1='20' y1='24' x2='20' y2='36' stroke='rgba(0,255,157,0.07)' stroke-width='0.3'/%3E%3Cline x1='60' y1='44' x2='60' y2='56' stroke='rgba(0,255,157,0.07)' stroke-width='0.3'/%3E%3Crect x='36' y='36' width='8' height='8' fill='none' stroke='rgba(0,255,157,0.09)' stroke-width='0.4' rx='1'/%3E%3C/svg%3E")`;

/* ── Sidebar background ── */
const SIDEBAR_BG = `${CIRCUIT_BG}, linear-gradient(180deg, #010d06 0%, #020f08 55%, #011009 100%)`;

/* ── CSS injected once — keyframes + utility classes ── */
const LIXUM_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  /* Suppress native scrollbar on html/body — LIXUM is its own scroll context */
  html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; width: 0 !important; }
  html, body { scrollbar-width: none !important; }

  @keyframes lixum-heartbeat {
    0%,100% { transform:translate(-50%,-50%) scale(1);    opacity:.50; }
    14%     { transform:translate(-50%,-50%) scale(1.18);  opacity:.85; }
    28%     { transform:translate(-50%,-50%) scale(.97);   opacity:.40; }
    42%     { transform:translate(-50%,-50%) scale(1.09);  opacity:.70; }
    65%     { transform:translate(-50%,-50%) scale(1);     opacity:.50; }
  }
  @keyframes lixum-ring {
    0%,100% { transform:translate(-50%,-50%) scale(1);    opacity:.14; }
    14%     { transform:translate(-50%,-50%) scale(1.22);  opacity:.28; }
    42%     { transform:translate(-50%,-50%) scale(1.12);  opacity:.20; }
  }
  @keyframes lixum-fadein {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0);    }
  }

  /* Monospace numbers — applied to all data values */
  .lixum-num {
    font-family: 'Courier New', 'Roboto Mono', monospace;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
  }

  /* Card hover/active transitions */
  .lixum-card {
    transition: transform .28s cubic-bezier(.25,.46,.45,.94),
                box-shadow .28s cubic-bezier(.25,.46,.45,.94),
                border-color .28s ease,
                background .28s ease;
  }
  .lixum-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(0,255,157,.10), 0 6px 18px rgba(0,0,0,.40) !important;
    border-color: rgba(0,255,157,.18) !important;
    background: rgba(0,255,157,.04) !important;
  }
  .lixum-card:active {
    transform: scale(.985) translateY(-1px);
    box-shadow: 0 6px 20px rgba(0,0,0,.30) !important;
  }
  .lixum-vitality-card {
    transition: transform .28s cubic-bezier(.25,.46,.45,.94),
                box-shadow .28s cubic-bezier(.25,.46,.45,.94),
                border-color .28s ease;
  }
  .lixum-vitality-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 64px rgba(0,255,157,.14), 0 8px 24px rgba(0,0,0,.45) !important;
    border-color: rgba(0,255,157,.24) !important;
  }
  .lixum-vitality-card:active {
    transform: scale(.990) translateY(-1px);
  }

  /* Staggered entrance */
  .lixum-animate { animation: lixum-fadein .40s ease-out both; }

  /* Neon X glow */
  .lixum-x {
    color: #00ff9d;
    text-shadow: 0 0 12px #00ff9d, 0 0 28px rgba(0,255,157,.50), 0 0 50px rgba(0,255,157,.20);
  }
`;

/* ══════════════════════════════════════════════════════════
   LIXUM DASHBOARD v4
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

  /* ── Lock outer scroll (html + body) so old design never bleeds through ── */
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

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
          style={{ background: "#020c07", backgroundImage: CIRCUIT_BG }}>
          <div className="flex items-center gap-0 font-black text-2xl tracking-[.2em]"
            style={{ fontFamily: "'Courier New', monospace" }}>
            <span style={{ color: "#8b949e" }}>L</span>
            <span className="lixum-x">X</span>
          </div>
          <div className="w-7 h-7 border-2 border-emerald-500/20 border-t-[#00ff9d] rounded-full animate-spin"
            style={{ boxShadow: "0 0 12px rgba(0,255,157,.4)" }} />
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
          style={{ background: "#020c07", backgroundImage: CIRCUIT_BG }}>
          <h1 className="text-3xl font-black tracking-[.22em]"
            style={{ fontFamily: "'Courier New', monospace" }}>
            <span style={{ color: "#8b949e" }}>LI</span>
            <span className="lixum-x">X</span>
            <span style={{ color: "#8b949e" }}>UM</span>
          </h1>
          <p className="text-white/40 text-center max-w-xs text-sm">{t.dashboard.completeOnboarding}</p>
          <Link href={`/${locale}/onboarding`}
            className="font-bold px-8 py-3 rounded-xl text-black text-sm transition-all hover:brightness-110"
            style={{ background: "#00ff9d", boxShadow: "0 0 20px rgba(0,255,157,.4)" }}>
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
    background:    "rgba(0,8,4,0.40)",
    backdropFilter:"blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border:        "1px solid rgba(255,255,255,0.08)",
    boxShadow:     "0 4px 24px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.05)",
  };

  /* ── Vitality card ── */
  const vitalityCard = {
    background:    "linear-gradient(135deg, rgba(255,255,255,.06) 0%, rgba(0,255,157,.03) 100%)",
    backdropFilter:"blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
    border:        "1px solid rgba(255,255,255,0.09)",
    boxShadow:     "0 8px 48px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.07)",
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{LIXUM_STYLES}</style>

      {/* Full-screen LIXUM overlay — z-[60] covers standard Navbar/MobileNav */}
      <div className="fixed inset-0 z-[60] text-white flex overflow-hidden"
        style={{ background: "#020c07", backgroundImage: CIRCUIT_BG, fontFamily: "'Outfit', 'Poppins', sans-serif" }}>

        {/* ════ HEARTBEAT PULSE — CSS only, GPU-composited ════ */}
        <div aria-hidden="true" className="pointer-events-none select-none">
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            width: "55vmin", height: "55vmin", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,255,157,.18) 0%, rgba(0,255,157,.06) 40%, transparent 70%)",
            animation: "lixum-heartbeat 4s cubic-bezier(.36,.07,.19,.97) infinite",
            willChange: "transform, opacity",
          }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            width: "78vmin", height: "78vmin", borderRadius: "50%",
            border: "1px solid rgba(0,255,157,.10)",
            animation: "lixum-ring 4s cubic-bezier(.36,.07,.19,.97) infinite",
            willChange: "transform, opacity",
          }} />
        </div>

        {/* ════ SIDEBAR ════ */}
        <aside className="flex flex-shrink-0 flex-col items-center pt-6 pb-5 w-14 md:w-[5.5rem]"
          style={{
            borderRadius: "0 24px 24px 0",
            backgroundImage: SIDEBAR_BG,
            borderRight: "1px solid rgba(0,255,157,.06)",
            boxShadow: "4px 0 32px rgba(0,0,0,.55), inset -1px 0 0 rgba(0,255,157,.04)",
          }}>

          {/* ── Logo mark ── */}
          <div className="flex flex-col items-center mb-6 flex-shrink-0">
            {/* LX badge: dark glass */}
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center select-none mb-1"
              style={{
                background: "rgba(0,255,157,.06)",
                border: "1px solid rgba(0,255,157,.18)",
                boxShadow: "0 0 16px rgba(0,255,157,.14), inset 0 1px 0 rgba(255,255,255,.05)",
              }}>
              {/* L silver, X neon */}
              <span className="font-black text-xs md:text-sm" style={{ fontFamily: "'Courier New', monospace", letterSpacing: "0.05em" }}>
                <span style={{ color: "#7d8590" }}>L</span>
                <span className="lixum-x">X</span>
              </span>
            </div>
            <p className="text-[5px] md:text-[5.5px] uppercase font-black tracking-[.30em]"
              style={{ color: "rgba(0,255,157,.35)" }}>
              lixum
            </p>
          </div>

          {/* ── Nav links — justify-around fills full height ── */}
          <nav className="flex flex-col items-center w-full px-1 md:px-2 flex-1 justify-around">
            {NAV_ITEMS.map(({ Icon, labelFr, labelEn, path }) => {
              const isActive = pathname.includes(`/${path}`);
              return (
                <Link key={path} href={`/${locale}/${path}`} prefetch={true}
                  className="relative flex flex-col items-center gap-1.5 w-full py-2.5 rounded-2xl transition-all duration-200"
                  style={isActive ? {
                    backgroundColor: "rgba(0,255,157,.06)",
                    boxShadow: "inset 0 2px 8px rgba(0,0,0,.5), 0 0 12px rgba(0,255,157,.08)",
                  } : undefined}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,.03)";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  }}
                >
                  {/* Active left-bar indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                      style={{ background: "#00ff9d", boxShadow: "0 0 10px #00ff9d, 0 0 20px rgba(0,255,157,.4)" }} />
                  )}
                  {/* Icon */}
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2 : 1.5}
                    style={{
                      color: isActive ? "#00ff9d" : "rgba(255,255,255,.28)",
                      filter: isActive ? "drop-shadow(0 0 6px rgba(0,255,157,.7)) drop-shadow(0 0 14px rgba(0,255,157,.3))" : "none",
                      transition: "color .2s, filter .2s",
                    }}
                  />
                  {/* Label — desktop only */}
                  <span className="hidden md:block text-[6px] uppercase font-black tracking-widest"
                    style={{ color: isActive ? "rgba(0,255,157,.8)" : "rgba(255,255,255,.25)" }}>
                    {locale === "fr" ? labelFr : labelEn}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* ── Logout ── */}
          <button onClick={handleLogout}
            className="flex flex-col items-center gap-1.5 rounded-2xl w-full py-2.5 mt-3 flex-shrink-0 transition-all duration-200"
            style={{ color: "rgba(255,255,255,.18)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "#f87171";
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239,68,68,.05)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.18)";
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
            }}
          >
            <LogOut size={20} strokeWidth={1.5} />
            <span className="hidden md:block text-[6px] uppercase font-black tracking-widest">
              {locale === "fr" ? "Sortir" : "Exit"}
            </span>
          </button>
        </aside>

        {/* ════ MAIN CONTENT ════ */}
        <main className="flex-1 overflow-y-auto relative">

          {/* Static ambient glow — not animated, zero perf cost */}
          <div className="pointer-events-none fixed top-0 left-[20%] w-72 h-72 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,255,157,.05) 0%, transparent 70%)", filter: "blur(50px)" }} />

          <div className="flex flex-col items-center px-3 pt-5 pb-8 md:px-7 md:pt-7 min-h-full">

            {/* ── HEADER — no notification bell ── */}
            <header className="w-full max-w-3xl flex justify-between items-center mb-6 md:mb-8 lixum-animate">
              <div>
                {/* Futuristic monospace LIXUM logo */}
                <h1 className="font-black tracking-[.22em] leading-none text-xl md:text-2xl"
                  style={{ fontFamily: "'Courier New', monospace" }}>
                  <span style={{ color: "#8b949e" }}>LI</span>
                  <span className="lixum-x">X</span>
                  <span style={{ color: "#8b949e" }}>UM</span>
                </h1>
                <p className="text-[7px] md:text-[8px] uppercase font-semibold mt-0.5 tracking-[.38em]"
                  style={{ color: "rgba(0,255,157,.45)" }}>
                  Bio-Digital Dashboard
                </p>
              </div>
              {/* User name only — bell removed */}
              <span className="text-sm text-white/30 font-semibold truncate max-w-[10rem]">
                {displayName}
              </span>
            </header>

            {/* ── VITALITY CARD ── */}
            <section className="w-full max-w-3xl mb-5 lixum-animate" style={{ animationDelay: ".05s" }}>
              <div className="lixum-vitality-card relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 cursor-default"
                style={vitalityCard}>
                {/* Corner glow */}
                <div className="absolute inset-0 pointer-events-none rounded-[2rem] md:rounded-[2.5rem]"
                  style={{ background: "radial-gradient(ellipse at 15% 8%, rgba(0,255,157,.05) 0%, transparent 50%)" }} />

                {/* Top row */}
                <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-7">
                  <div className="space-y-1.5">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[.22em]"
                      style={{ color: "#00ff9d", textShadow: "0 0 10px rgba(0,255,157,.4)" }}>
                      {locale === "fr" ? "Score de Vitalité" : "Vitality Score"}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="lixum-num text-6xl md:text-7xl font-black tracking-tighter leading-none">
                        {dailyScore}
                      </span>
                      <span className="lixum-x text-2xl md:text-3xl font-black">%</span>
                    </div>
                    <p className="text-[10px] md:text-xs text-white/30 font-medium">
                      {displayName}
                    </p>
                  </div>

                  <div className="flex gap-5 md:gap-8">
                    <div className="text-right">
                      <p className="text-[8px] md:text-[9px] text-white/25 font-black uppercase tracking-wider mb-1">
                        {locale === "fr" ? "Objectif" : "Goal"}
                      </p>
                      <p className="lixum-num text-xl md:text-2xl font-black italic text-amber-400">
                        {profile.daily_calorie_target.toLocaleString()}
                        <span className="text-xs font-normal text-white/25 ml-0.5">kcal</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] md:text-[9px] text-white/25 font-black uppercase tracking-wider mb-1">
                        {locale === "fr" ? "Consommé" : "Consumed"}
                      </p>
                      <p className="lixum-num text-xl md:text-2xl font-black italic text-amber-300">
                        {todayConsumed.toLocaleString()}
                        <span className="text-xs font-normal text-white/25 ml-0.5">kcal</span>
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
                    boxShadow: "0 0 16px rgba(245,158,11,.42)",
                  }} />
                </div>

                {/* Stats row */}
                <div className="relative grid grid-cols-4 gap-2 pt-5 md:pt-6"
                  style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
                  {[
                    { label: locale === "fr" ? "Brûlés"   : "Burned",  value: todayBurned,           unit: "kcal", color: "#60a5fa" },
                    { label: locale === "fr" ? "Restants" : "Left",    value: remaining,             unit: "kcal", color: remaining >= 0 ? "#00ff9d" : "#f87171" },
                    { label: "BMR",                                     value: Math.round(profile.bmr), unit: "kcal", color: "rgba(255,255,255,.65)" },
                    { label: locale === "fr" ? "Série"    : "Streak",  value: streak,                unit: locale === "fr" ? "j" : "d", color: "#00ff9d" },
                  ].map((stat, i) => (
                    <div key={stat.label} className={`text-center ${i < 3 ? "border-r" : ""}`}
                      style={{ borderColor: "rgba(255,255,255,.05)" }}>
                      <p className="text-[7px] md:text-[8px] text-white/25 uppercase font-black tracking-wider mb-1.5">
                        {stat.label}
                      </p>
                      <p className="lixum-num font-black text-base md:text-lg leading-none" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                      <p className="text-[7px] text-white/18 mt-0.5">{stat.unit}</p>
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
                  <span className="text-[9px] md:text-[10px] text-amber-500/80 font-black uppercase tracking-widest">
                    {locale === "fr" ? "Repas du Jour" : "Today's Meals"}
                  </span>
                  <Link href={`/${locale}/meals`} prefetch={true}
                    className="text-[8px] md:text-[9px] text-white/20 hover:text-[#00ff9d] transition-colors uppercase font-black tracking-wider">
                    {locale === "fr" ? "Tout voir" : "See all"} →
                  </Link>
                </div>

                {todayMeals.length === 0 ? (
                  <p className="text-white/20 text-sm py-6 text-center flex-1">
                    {locale === "fr" ? "Aucun repas enregistré" : "No meals logged yet"}
                  </p>
                ) : (
                  <div className="flex-1 space-y-2">
                    {todayMeals.slice(0, 5).map((meal: Meal) => (
                      <div key={meal.id} className="flex justify-between items-center py-1.5"
                        style={{ borderBottom: "1px solid rgba(0,255,157,.05)" }}>
                        <span className="text-xs md:text-sm text-white/55 font-medium truncate mr-2">{meal.name}</span>
                        <span className="lixum-num text-xs md:text-sm text-amber-400/85 font-black flex-shrink-0">
                          {meal.calories} kcal
                        </span>
                      </div>
                    ))}
                    {todayMeals.length > 5 && (
                      <p className="text-[8px] text-white/18 text-center pt-1">
                        +{todayMeals.length - 5} {locale === "fr" ? "autres" : "more"}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-3" style={{ borderTop: "1px solid rgba(0,255,157,.05)" }}>
                  <Link href={`/${locale}/meals`} prefetch={true}
                    className="text-[9px] md:text-[10px] text-amber-500/70 hover:text-amber-400 font-black uppercase tracking-wider transition-colors">
                    → {locale === "fr" ? "Gérer mes repas" : "Manage meals"}
                  </Link>
                </div>
              </div>

              {/* Activity */}
              <div className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 flex flex-col overflow-hidden min-h-[15rem] md:min-h-[17rem] lixum-animate cursor-default"
                style={{ ...glassCard, animationDelay: ".15s" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] md:text-[10px] text-amber-500/80 font-black uppercase tracking-widest">
                    {locale === "fr" ? "Activité & Énergie" : "Activity & Energy"}
                  </span>
                  <Link href={`/${locale}/activities`} prefetch={true}
                    className="text-[8px] md:text-[9px] text-white/20 hover:text-[#00ff9d] transition-colors uppercase font-black tracking-wider">
                    {locale === "fr" ? "Voir" : "View"} →
                  </Link>
                </div>

                <div className="lixum-num text-3xl md:text-4xl font-black leading-none" style={{ color: "#60a5fa" }}>
                  {todayBurned}
                  <span className="text-sm md:text-base font-normal text-white/25 ml-1.5">kcal</span>
                </div>
                <p className="text-[8px] md:text-[9px] text-white/25 mt-1">
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
                          height: `${hPct}%`,
                          background:  isLast ? "#f59e0b" : "rgba(255,255,255,.06)",
                          boxShadow:   isLast ? "0 0 14px rgba(245,158,11,.6)" : "none",
                        }} />
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Streak */}
              <div className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 min-h-[12rem] lixum-animate cursor-default"
                style={{ ...glassCard, animationDelay: ".20s" }}>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest block mb-3"
                  style={{ color: "#00ff9d", textShadow: "0 0 8px rgba(0,255,157,.4)" }}>
                  {locale === "fr" ? "Série Verte — Santé" : "Green Streak — Health"}
                </span>

                <div className="lixum-num text-4xl md:text-5xl font-black leading-none" style={{ color: "#00ff9d" }}>
                  {streak}
                  <span className="text-base md:text-lg font-normal text-white/25 ml-1.5">
                    {locale === "fr" ? "jours" : "days"}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full overflow-hidden mt-4"
                  style={{ background: "rgba(255,255,255,.04)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${Math.min(100, streak * 10)}%`,
                    background: "linear-gradient(90deg,#059669,#00ff9d)",
                    boxShadow: "0 0 10px rgba(0,255,157,.5)",
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

              {/* Weight projection */}
              <div className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 min-h-[12rem] lixum-animate cursor-default"
                style={{ ...glassCard, animationDelay: ".25s" }}>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest block mb-3"
                  style={{ color: "#00ff9d", textShadow: "0 0 8px rgba(0,255,157,.4)" }}>
                  {locale === "fr" ? "Santé — Poids Projeté" : "Health — Projected Weight"}
                </span>

                <div className="lixum-num text-4xl md:text-5xl font-black leading-none">
                  {projectedWeight.toFixed(1)}
                  <span className="text-base md:text-lg font-normal text-white/25 ml-1.5">kg</span>
                </div>

                <p className="text-xs md:text-sm text-white/25 mt-2">
                  {locale === "fr" ? "Actuel :" : "Current:"}{" "}
                  <span className="lixum-num text-white/45 font-bold">{profile.weight} kg</span>
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 text-xs md:text-sm font-black px-3 py-1.5 rounded-xl"
                  style={{
                    background: weightChange > 0 ? "rgba(239,68,68,.08)" : weightChange < 0 ? "rgba(0,255,157,.07)" : "rgba(255,255,255,.04)",
                    border: `1px solid ${weightChange > 0 ? "rgba(239,68,68,.16)" : weightChange < 0 ? "rgba(0,255,157,.18)" : "rgba(255,255,255,.07)"}`,
                    color: weightChange > 0 ? "#f87171" : weightChange < 0 ? "#00ff9d" : "rgba(255,255,255,.35)",
                  }}>
                  {weightChange > 0 ? "↑" : weightChange < 0 ? "↓" : "→"}
                  <span className="lixum-num">{Math.abs(weightChange).toFixed(1)} kg</span>
                  <span className="font-normal opacity-55">{locale === "fr" ? " /30j" : " /30d"}</span>
                </div>

                <p className="text-[8px] md:text-[9px] text-white/25 mt-3 font-medium">
                  TDEE <span className="lixum-num" style={{ color: "rgba(255,255,255,.45)" }}>{Math.round(profile.tdee)}</span> kcal/j
                </p>
              </div>
            </div>

            {/* ── SPORT RECOMMENDATION ── */}
            {recommendation && (
              <div className="w-full max-w-3xl mt-4 md:mt-5 lixum-animate" style={{ animationDelay: ".30s" }}>
                <div className="lixum-card rounded-[1.75rem] md:rounded-[2rem] p-5 md:p-6 cursor-default"
                  style={{ background: "rgba(239,68,68,.05)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(239,68,68,.12)", boxShadow: "0 4px 24px rgba(0,0,0,.32)" }}>
                  <p className="text-[9px] md:text-[10px] text-red-400/90 font-black uppercase tracking-widest mb-4">
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
                        <p className="lixum-num text-xl md:text-2xl font-black text-amber-500">{item.value}</p>
                        <p className="text-[8px] md:text-[9px] text-white/25 uppercase tracking-wide mt-0.5">{item.label}</p>
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
