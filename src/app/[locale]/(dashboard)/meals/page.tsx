"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getDictionary, isValidLocale } from "@/i18n";
import { updateDailySummary } from "@/utils/daily-summary";
import AddMealForm from "@/components/meals/AddMealForm";
import type { Meal } from "@/types";

export default function MealsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string)
    ? (params.locale as "fr" | "en")
    : "fr";
  const t = getDictionary(locale);
  const supabase = createClient();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const loadMeals = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    setUserId(user.id);

    const { data } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", selectedDate)
      .order("created_at", { ascending: true });

    setMeals((data as Meal[]) ?? []);
    setLoading(false);
  }, [supabase, router, locale, selectedDate]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const handleDelete = async (mealId: string, date: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("meals").delete().eq("id", mealId);
    await updateDailySummary(supabase, userId, date);
    loadMeals();
  };

  const mealsByType = (type: "breakfast" | "lunch" | "dinner" | "snack") =>
    meals.filter((m) => m.meal_type === type);

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

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
        <h1 className="text-2xl font-bold text-gray-100">{t.meals.title}</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/meals/scan`}
            className="btn-accent text-sm py-2 px-4 flex items-center gap-1.5"
          >
            <span>&#x1F4F7;</span>
            <span>{t.meals.scanMeal}</span>
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary text-sm"
          >
            {showForm ? t.common.cancel : t.meals.addMeal}
          </button>
        </div>
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setLoading(true);
          }}
          className="input-field flex-1"
        />
        <div className="card py-2 px-4 text-center">
          <p className="text-sm text-dark-100">{t.dashboard.consumed}</p>
          <p className="text-lg font-bold text-primary-400">{totalCalories} kcal</p>
        </div>
      </div>

      {/* Add meal form */}
      {showForm && (
        <AddMealForm
          userId={userId}
          locale={locale}
          t={t}
          onMealAdded={() => {
            setShowForm(false);
            loadMeals();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Meal type sections */}
      {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => {
        const typeMeals = mealsByType(type);
        return (
          <div key={type} className="card">
            <h2 className="text-lg font-semibold text-gray-100 mb-3">
              {t.meals[type]}
              {typeMeals.length > 0 && (
                <span className="text-sm font-normal text-dark-100 ml-2">
                  ({typeMeals.reduce((s, m) => s + m.calories, 0)} kcal)
                </span>
              )}
            </h2>
            {typeMeals.length === 0 ? (
              <p className="empty-state">{t.common.noResults}</p>
            ) : (
              <div className="space-y-2">
                {typeMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between bg-dark-700 rounded-xl p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-100">{meal.name}</p>
                      <p className="text-sm text-dark-100">
                        {meal.calories} kcal
                        {meal.protein > 0 && ` · P: ${meal.protein}g`}
                        {meal.carbs > 0 && ` · C: ${meal.carbs}g`}
                        {meal.fat > 0 && ` · F: ${meal.fat}g`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(meal.id, meal.date)}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      {t.common.delete}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
