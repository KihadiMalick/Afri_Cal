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
import ScoreCard from "@/components/dashboard/ScoreCard";
import StreakDisplay from "@/components/dashboard/StreakDisplay";
import BadgesDisplay from "@/components/dashboard/BadgesDisplay";
import WeightProjectionCard from "@/components/dashboard/WeightProjectionCard";
import CaloriesChart from "@/components/charts/CaloriesChart";
import WeightChart from "@/components/charts/WeightChart";
import AddWeightForm from "@/components/weight/AddWeightForm";
import type { UserProfile, Meal, Badge } from "@/types";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const t = getDictionary(locale);
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [todayConsumed, setTodayConsumed] = useState(0);
  const [todayBurned, setTodayBurned] = useState(0);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [dailyScore, setDailyScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [projectedWeight, setProjectedWeight] = useState(0);
  const [weightChange, setWeightChange] = useState(0);
  const [caloriesChartData, setCaloriesChartData] = useState<{ date: string; consumed: number; target: number }[]>([]);
  const [weightChartData, setWeightChartData] = useState<{ date: string; weight: number }[]>([]);

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    setUserEmail(user.email || "");
    setUserId(user.id);
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
    const consumed = meals.reduce((sum, m) => sum + m.calories, 0);
    setTodayConsumed(consumed);

    // Load today's activities
    const { data: actData } = await supabase
      .from("activities")
      .select("calories_burned")
      .eq("user_id", user.id)
      .eq("date", todayStr);

    const burned = (actData ?? []).reduce(
      (sum: number, a: { calories_burned: number }) => sum + a.calories_burned, 0
    );
    setTodayBurned(burned);

    // Daily score
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target = (profileData as any)?.daily_calorie_target ?? 2000;
    setDailyScore(calculateDailyScore(consumed, burned, target));

    // Streak
    const s = await calculateGreenStreak(supabase, user.id);
    setStreak(s);
    setBadges(getBadges(s));

    // Weight projection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentWeight = (profileData as any)?.weight ?? 70;
    const proj = await calculateWeightProjection(supabase, user.id, currentWeight);
    setProjectedWeight(proj.projectedWeight);
    setWeightChange(proj.weightChange);

    // Calories chart: last 30 days
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
      (summaries ?? []).map((s: { date: string; total_calories_consumed: number; calorie_target: number }) => ({
        date: s.date,
        consumed: s.total_calories_consumed,
        target: s.calorie_target,
      }))
    );

    // Weight chart
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: weightLogs } = await (supabase as any)
      .from("weight_logs")
      .select("date, weight")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
      .limit(60);

    setWeightChartData(
      (weightLogs ?? []).map((w: { date: string; weight: number }) => ({
        date: w.date,
        weight: w.weight,
      }))
    );

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loader" />
      </div>
    );
  }

  if (!profile || !profile.onboarding_completed) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-100">
          {t.dashboard.welcome}, {userEmail.split("@")[0]}
        </h1>
        <div className="card text-center py-12">
          <p className="text-dark-100 mb-6">{t.dashboard.completeOnboarding}</p>
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

  const progressPercent = Math.min(100, Math.round((todayConsumed / profile.daily_calorie_target) * 100));
  const progressColor = surplus > 0 ? "bg-red-500" : surplus === 0 ? "bg-accent-400" : "bg-primary-500";

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-gray-100">
        {t.dashboard.welcome}, {profile.full_name || userEmail.split("@")[0]}
      </h1>

      {/* Score + Streak row */}
      <div className="grid grid-cols-2 gap-4">
        <ScoreCard score={dailyScore} locale={locale} />
        <StreakDisplay streak={streak} locale={locale} />
      </div>

      {/* Progress bar */}
      <div className="card-static">
        <div className="flex justify-between text-sm text-dark-100 mb-2">
          <span>{t.dashboard.dailyCalories}</span>
          <span>{todayConsumed} / {profile.daily_calorie_target} kcal</span>
        </div>
        <div className="w-full bg-dark-600 rounded-full h-3">
          <div
            className={`${progressColor} h-3 rounded-full animate-progress`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Calorie Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-dark-100">{t.dashboard.target}</p>
          <p className="text-2xl font-bold text-primary-400 mt-1">{profile.daily_calorie_target}</p>
          <p className="text-xs text-dark-200">{t.dashboard.kcalPerDay}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-dark-100">{t.dashboard.consumed}</p>
          <p className="text-2xl font-bold text-accent-400 mt-1">{todayConsumed}</p>
          <p className="text-xs text-dark-200">kcal</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-dark-100">{t.dashboard.burned}</p>
          <p className="text-2xl font-bold text-primary-400 mt-1">{todayBurned}</p>
          <p className="text-xs text-dark-200">kcal</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-dark-100">{t.dashboard.remaining}</p>
          <p className={`text-2xl font-bold mt-1 ${remaining >= 0 ? "text-gray-100" : "text-red-400"}`}>
            {remaining}
          </p>
          <p className="text-xs text-dark-200">kcal</p>
        </div>
      </div>

      {/* Sport recommendation */}
      {recommendation && (
        <div className="card border-l-4 border-l-red-500">
          <h2 className="text-lg font-semibold text-gray-100 mb-2">{t.activities.recommendation}</h2>
          <p className="text-sm text-red-400 mb-3">
            {locale === "fr" ? `Surplus de ${recommendation.surplus} kcal` : `${recommendation.surplus} kcal surplus`}
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-primary-500/10 rounded-2xl p-3">
              <p className="text-lg font-bold text-primary-400">{recommendation.walkingKm}</p>
              <p className="text-xs text-dark-100">km {locale === "fr" ? "marche" : "walk"}</p>
            </div>
            <div className="bg-blue-500/10 rounded-2xl p-3">
              <p className="text-lg font-bold text-blue-400">{recommendation.runningMinutes}</p>
              <p className="text-xs text-dark-100">min {locale === "fr" ? "course" : "run"}</p>
            </div>
            <div className="bg-purple-500/10 rounded-2xl p-3">
              <p className="text-lg font-bold text-purple-400">{recommendation.steps}</p>
              <p className="text-xs text-dark-100">{locale === "fr" ? "pas" : "steps"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Calories chart */}
      <div className="card-static">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          {locale === "fr" ? "Calories 30 jours" : "Calories 30 days"}
        </h2>
        <CaloriesChart data={caloriesChartData} locale={locale} />
      </div>

      {/* Weight tracking */}
      <div className="card-static">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          {locale === "fr" ? "Suivi du poids" : "Weight Tracking"}
        </h2>
        <AddWeightForm userId={userId} locale={locale} onWeightAdded={() => loadDashboard()} />
        <div className="mt-4">
          <WeightChart data={weightChartData} locale={locale} />
        </div>
      </div>

      {/* Weight projection */}
      <WeightProjectionCard
        currentWeight={profile.weight}
        projectedWeight={projectedWeight}
        weightChange={weightChange}
        locale={locale}
      />

      {/* BMR / TDEE */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-sm text-dark-100">{t.dashboard.bmr}</p>
          <p className="text-xl font-bold text-gray-100 mt-1">{Math.round(profile.bmr)}</p>
          <p className="text-xs text-dark-200">kcal</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-dark-100">{t.dashboard.tdee}</p>
          <p className="text-xl font-bold text-gray-100 mt-1">{Math.round(profile.tdee)}</p>
          <p className="text-xs text-dark-200">kcal</p>
        </div>
      </div>

      {/* Badges */}
      <BadgesDisplay badges={badges} locale={locale} />

      {/* Today's meals & activities */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">{t.meals.title}</h2>
            <Link href={`/${locale}/meals`} className="text-sm text-primary-400 hover:underline">
              {locale === "fr" ? "Voir tout" : "View all"}
            </Link>
          </div>
          {todayMeals.length === 0 ? (
            <p className="empty-state">{t.common.noResults}</p>
          ) : (
            <div className="space-y-2">
              {todayMeals.slice(0, 5).map((meal) => (
                <div key={meal.id} className="flex justify-between text-sm">
                  <span className="text-gray-200">{meal.name}</span>
                  <span className="text-dark-100">{meal.calories} kcal</span>
                </div>
              ))}
              {todayMeals.length > 5 && (
                <p className="text-xs text-dark-200">+{todayMeals.length - 5} {locale === "fr" ? "autres" : "more"}</p>
              )}
            </div>
          )}
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">{t.activities.title}</h2>
            <Link href={`/${locale}/activities`} className="text-sm text-primary-400 hover:underline">
              {locale === "fr" ? "Voir tout" : "View all"}
            </Link>
          </div>
          {todayBurned === 0 ? (
            <p className="empty-state">{t.common.noResults}</p>
          ) : (
            <p className="text-sm text-primary-400 font-medium">
              {todayBurned} kcal {locale === "fr" ? "brulees aujourd'hui" : "burned today"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
