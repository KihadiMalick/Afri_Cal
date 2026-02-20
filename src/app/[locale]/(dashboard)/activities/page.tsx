"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { getDictionary, isValidLocale } from "@/i18n";
import { generateSportRecommendation } from "@/utils/sport-recommendation";
import type { Activity } from "@/types";

export default function ActivitiesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string)
    ? (params.locale as "fr" | "en")
    : "fr";
  const t = getDictionary(locale);
  const supabase = createClient();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [surplus, setSurplus] = useState(0);
  const todayStr = new Date().toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    // Load today's activities
    const { data: actData } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayStr)
      .order("created_at", { ascending: false });

    setActivities((actData as Activity[]) ?? []);

    // Load today's daily summary for surplus
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: summary } = await (supabase as any)
      .from("daily_summary")
      .select("calorie_balance")
      .eq("user_id", user.id)
      .eq("date", todayStr)
      .single();

    if (summary) {
      const balance = (summary as { calorie_balance: number }).calorie_balance;
      setSurplus(balance > 0 ? balance : 0);
    }

    setLoading(false);
  }, [supabase, router, locale, todayStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteActivity = async (activityId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("activities").delete().eq("id", activityId);
    loadData();
  };

  const recommendation = generateSportRecommendation(surplus);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">
          {t.activities.title}
        </h1>
      </div>

      {/* Sport recommendation card */}
      <div className="card border-l-4 border-l-accent-400">
        <h2 className="text-lg font-semibold text-gray-100 mb-2">
          {t.activities.recommendation}
        </h2>
        {recommendation ? (
          <div className="space-y-3">
            <p className="text-sm text-red-400 font-medium">
              {locale === "fr"
                ? `Surplus de ${recommendation.surplus} kcal aujourd'hui`
                : `${recommendation.surplus} kcal surplus today`}
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-primary-500/10 rounded-2xl p-3">
                <p className="text-2xl font-bold text-primary-400">
                  {recommendation.walkingKm}
                </p>
                <p className="text-xs text-dark-100">
                  km {locale === "fr" ? "marche" : "walking"}
                </p>
              </div>
              <div className="bg-blue-500/10 rounded-2xl p-3">
                <p className="text-2xl font-bold text-blue-400">
                  {recommendation.runningMinutes}
                </p>
                <p className="text-xs text-dark-100">
                  min {locale === "fr" ? "course" : "running"}
                </p>
              </div>
              <div className="bg-purple-500/10 rounded-2xl p-3">
                <p className="text-2xl font-bold text-purple-400">
                  {recommendation.steps}
                </p>
                <p className="text-xs text-dark-100">
                  {locale === "fr" ? "pas" : "steps"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-primary-400 text-sm font-medium">
            {locale === "fr"
              ? "Aucun surplus ! Vous etes dans l'objectif."
              : "No surplus! You're on target."}
          </p>
        )}
      </div>

      {/* Today's activities */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-100 mb-3">
          {locale === "fr" ? "Activites du jour" : "Today's activities"}
        </h2>
        {activities.length === 0 ? (
          <p className="empty-state">{t.common.noResults}</p>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between bg-dark-700 rounded-xl p-3"
              >
                <div>
                  <p className="font-medium text-gray-100">{activity.name}</p>
                  <p className="text-sm text-dark-100">
                    {activity.duration_minutes} min · {activity.calories_burned} kcal
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteActivity(activity.id)}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
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
