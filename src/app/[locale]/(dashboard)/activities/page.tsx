"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { getDictionary, isValidLocale } from "@/i18n";
import { generateSportRecommendation } from "@/utils/sport-recommendation";
import { GLASS_CARD } from "@/components/lixum/LixumShell";
import type { Activity } from "@/types";

export default function ActivitiesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const t      = getDictionary(locale);
  const supabase = createClient();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [surplus,    setSurplus]    = useState(0);
  const todayStr = new Date().toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push(`/${locale}/login`); return; }

    const { data: actData } = await supabase
      .from("activities").select("*").eq("user_id", user.id).eq("date", todayStr)
      .order("created_at", { ascending: false });
    setActivities((actData as Activity[]) ?? []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: summary } = await (supabase as any)
      .from("daily_summary").select("calorie_balance")
      .eq("user_id", user.id).eq("date", todayStr).single();
    if (summary) {
      const balance = (summary as { calorie_balance: number }).calorie_balance;
      setSurplus(balance > 0 ? balance : 0);
    }
    setLoading(false);
  }, [supabase, router, locale, todayStr]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDeleteActivity = async (activityId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("activities").delete().eq("id", activityId);
    loadData();
  };

  const recommendation = generateSportRecommendation(surplus);
  const totalBurned    = activities.reduce((s, a) => s + a.calories_burned, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center px-3 pt-5 pb-10 md:px-7 md:pt-7 min-h-full">
        <div className="w-full max-w-3xl mb-6">
          <div className="lixum-skeleton h-9 w-44 rounded-2xl mb-2" />
          <div className="lixum-skeleton h-4 w-56 rounded-xl" />
        </div>
        <div className="lixum-skeleton w-full max-w-3xl rounded-[2rem] mb-5" style={{ height:"8rem" }} />
        <div className="lixum-skeleton w-full max-w-3xl rounded-[1.75rem] mb-5" style={{ height:"10rem" }} />
        <div className="lixum-skeleton w-full max-w-3xl rounded-[1.75rem]" style={{ height:"12rem" }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-3 pt-5 pb-10 md:px-7 md:pt-7 min-h-full">

      {/* ── HEADER ── */}
      <header className="w-full max-w-3xl mb-6 lixum-animate">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{t.activities.title}</h1>
        <p className="text-sm text-white/50 font-medium mt-0.5">
          {locale === "fr" ? "Dépense énergétique du jour" : "Today's energy expenditure"}
        </p>
      </header>

      {/* ── TOTAL BURNED BANNER ── */}
      <div
        className="w-full max-w-3xl rounded-[2rem] p-6 md:p-8 mb-5 lixum-animate"
        style={{ animationDelay:".05s", ...GLASS_CARD, border:"1px solid rgba(96,165,250,.18)" }}
      >
        <p className="text-xs text-white/55 uppercase font-bold tracking-widest mb-2">
          {locale === "fr" ? "Total brûlé aujourd'hui" : "Total burned today"}
        </p>
        <p className="lixum-num text-5xl md:text-6xl font-black leading-none" style={{ color:"#60a5fa" }}>
          {totalBurned}
          <span className="text-xl font-medium text-white/50 ml-2">kcal</span>
        </p>
      </div>

      {/* ── SPORT RECOMMENDATION ── */}
      <div
        className="lixum-card w-full max-w-3xl rounded-[1.75rem] p-5 md:p-6 mb-5 lixum-animate"
        style={{ animationDelay:".10s", background:"rgba(239,68,68,.05)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:"1px solid rgba(239,68,68,.12)", boxShadow:"0 4px 24px rgba(0,0,0,.32)" }}
      >
        <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color:"#f87171" }}>
          {t.activities.recommendation}
        </h2>
        {recommendation ? (
          <>
            <p className="text-sm text-white/65 font-medium mb-4">
              {locale === "fr"
                ? `Surplus de ${recommendation.surplus} kcal — voici comment l'éliminer :`
                : `${recommendation.surplus} kcal surplus — here's how to burn it:`}
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { value: recommendation.walkingKm,      label: locale === "fr" ? "km marche"  : "km walk",   color:"#f59e0b" },
                { value: recommendation.runningMinutes,  label: locale === "fr" ? "min course" : "min run",    color:"#60a5fa" },
                { value: recommendation.steps,           label: locale === "fr" ? "pas"        : "steps",      color:"#a78bfa" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl py-3 px-2" style={{ background:"rgba(255,255,255,.04)" }}>
                  <p className="lixum-num text-2xl md:text-3xl font-black" style={{ color:item.color }}>{item.value}</p>
                  <p className="text-xs text-white/50 font-medium mt-1 uppercase tracking-wide">{item.label}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-base text-[#00ff9d] font-semibold">
            {locale === "fr" ? "✓ Aucun surplus ! Vous êtes dans l'objectif." : "✓ No surplus! You're on target."}
          </p>
        )}
      </div>

      {/* ── ACTIVITIES LIST ── */}
      <div
        className="lixum-card w-full max-w-3xl rounded-[1.75rem] p-5 md:p-6 lixum-animate"
        style={{ animationDelay:".15s", ...GLASS_CARD }}
      >
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-white/65">
          {locale === "fr" ? "Activités du jour" : "Today's activities"}
        </h2>
        {activities.length === 0 ? (
          <p className="text-white/40 text-base font-medium text-center py-6">{t.common.noResults}</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.06)" }}
              >
                <div>
                  <p className="font-semibold text-base text-white/90">{activity.name}</p>
                  <p className="text-sm text-white/45 mt-0.5">
                    <span className="lixum-num">{activity.duration_minutes}</span> min
                    {" · "}
                    <span className="lixum-num text-blue-400">{activity.calories_burned}</span> kcal
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteActivity(activity.id)}
                  className="text-red-400/50 hover:text-red-400 text-sm font-bold transition-colors ml-4 flex-shrink-0"
                >
                  {t.common.delete}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
