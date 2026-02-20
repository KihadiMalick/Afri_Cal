"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getDictionary, isValidLocale } from "@/i18n";
import { generateSportRecommendation } from "@/utils/sport-recommendation";
import type { UserProfile, Meal } from "@/types";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const t = getDictionary(locale);
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [todayConsumed, setTodayConsumed] = useState(0);
  const [todayBurned, setTodayBurned] = useState(0);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }

      setUserEmail(user.email || "");
      const todayStr = new Date().toISOString().split("T")[0];

      // Load profile
      const { data: profileData } = await supabase
        .from("users_profile")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData as UserProfile);
      }

      // Load today's meals
      const { data: mealsData } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", todayStr)
        .order("created_at", { ascending: true });

      const meals = (mealsData as Meal[]) ?? [];
      setTodayMeals(meals);
      setTodayConsumed(meals.reduce((sum, m) => sum + m.calories, 0));

      // Load today's activities burned
      const { data: actData } = await supabase
        .from("activities")
        .select("calories_burned")
        .eq("user_id", user.id)
        .eq("date", todayStr);

      const burned = (actData ?? []).reduce(
        (sum: number, a: { calories_burned: number }) => sum + a.calories_burned,
        0
      );
      setTodayBurned(burned);

      setLoading(false);
    }

    loadDashboard();
  }, [supabase, router, locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  // If no profile yet, show onboarding CTA
  if (!profile || !profile.onboarding_completed) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t.dashboard.welcome}, {userEmail.split("@")[0]}
        </h1>
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-6">{t.dashboard.completeOnboarding}</p>
          <Link href={`/${locale}/onboarding`} className="btn-primary">
            {t.dashboard.goToOnboarding}
          </Link>
        </div>
      </div>
    );
  }

  const remaining = profile.daily_calorie_target - todayConsumed + todayBurned;
  const surplus = todayConsumed - todayBurned - profile.daily_calorie_target;
  const recommendation = generateSportRecommendation(surplus);

  // Progress bar percentage (capped at 100%)
  const progressPercent = Math.min(
    100,
    Math.round((todayConsumed / profile.daily_calorie_target) * 100)
  );
  const progressColor =
    surplus > 0 ? "bg-red-500" : surplus === 0 ? "bg-yellow-400" : "bg-green-500";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {t.dashboard.welcome}, {profile.full_name || userEmail.split("@")[0]}
      </h1>

      {/* Progress bar */}
      <div className="card">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{t.dashboard.dailyCalories}</span>
          <span>{todayConsumed} / {profile.daily_calorie_target} kcal</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`${progressColor} h-3 rounded-full transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Calorie Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.target}</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {profile.daily_calorie_target}
          </p>
          <p className="text-xs text-gray-400">{t.dashboard.kcalPerDay}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.consumed}</p>
          <p className="text-2xl font-bold text-accent-500 mt-1">{todayConsumed}</p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.burned}</p>
          <p className="text-2xl font-bold text-green-500 mt-1">{todayBurned}</p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.remaining}</p>
          <p className={`text-2xl font-bold mt-1 ${remaining >= 0 ? "text-gray-700" : "text-red-500"}`}>
            {remaining}
          </p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
      </div>

      {/* Sport recommendation if surplus */}
      {recommendation && (
        <div className="card border-l-4 border-l-red-400">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {t.activities.recommendation}
          </h2>
          <p className="text-sm text-red-500 mb-3">
            {locale === "fr"
              ? `Surplus de ${recommendation.surplus} kcal`
              : `${recommendation.surplus} kcal surplus`}
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-50 rounded-lg p-2">
              <p className="text-lg font-bold text-green-600">{recommendation.walkingKm}</p>
              <p className="text-xs text-gray-500">km {locale === "fr" ? "marche" : "walk"}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="text-lg font-bold text-blue-600">{recommendation.runningMinutes}</p>
              <p className="text-xs text-gray-500">min {locale === "fr" ? "course" : "run"}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              <p className="text-lg font-bold text-purple-600">{recommendation.steps}</p>
              <p className="text-xs text-gray-500">{locale === "fr" ? "pas" : "steps"}</p>
            </div>
          </div>
        </div>
      )}

      {/* BMR / TDEE info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.bmr}</p>
          <p className="text-xl font-bold text-gray-700 mt-1">
            {Math.round(profile.bmr)}
          </p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.tdee}</p>
          <p className="text-xl font-bold text-gray-700 mt-1">
            {Math.round(profile.tdee)}
          </p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
      </div>

      {/* Today's meals summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {t.meals.title}
            </h2>
            <Link href={`/${locale}/meals`} className="text-sm text-primary-600 hover:underline">
              {locale === "fr" ? "Voir tout" : "View all"}
            </Link>
          </div>
          {todayMeals.length === 0 ? (
            <p className="text-gray-400 text-sm">{t.common.noResults}</p>
          ) : (
            <div className="space-y-2">
              {todayMeals.slice(0, 5).map((meal) => (
                <div key={meal.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{meal.name}</span>
                  <span className="text-gray-500">{meal.calories} kcal</span>
                </div>
              ))}
              {todayMeals.length > 5 && (
                <p className="text-xs text-gray-400">
                  +{todayMeals.length - 5} {locale === "fr" ? "autres" : "more"}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {t.activities.title}
            </h2>
            <Link href={`/${locale}/activities`} className="text-sm text-primary-600 hover:underline">
              {locale === "fr" ? "Voir tout" : "View all"}
            </Link>
          </div>
          {todayBurned === 0 ? (
            <p className="text-gray-400 text-sm">{t.common.noResults}</p>
          ) : (
            <p className="text-sm text-green-600 font-medium">
              {todayBurned} kcal {locale === "fr" ? "brûlées aujourd'hui" : "burned today"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
