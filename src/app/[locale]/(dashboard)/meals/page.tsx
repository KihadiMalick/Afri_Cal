"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getDictionary, isValidLocale } from "@/i18n";
import { updateDailySummary } from "@/utils/daily-summary";
import AddMealForm from "@/components/meals/AddMealForm";
import { GLASS_CARD } from "@/components/lixum/LixumShell";
import type { Meal } from "@/types";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export default function MealsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const t      = getDictionary(locale);
  const supabase = createClient();

  const [meals,        setMeals]        = useState<Meal[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [userId,       setUserId]       = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const loadMeals = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push(`/${locale}/login`); return; }
    setUserId(user.id);
    const { data } = await supabase
      .from("meals").select("*").eq("user_id", user.id).eq("date", selectedDate)
      .order("created_at", { ascending: true });
    setMeals((data as Meal[]) ?? []);
    setLoading(false);
  }, [supabase, router, locale, selectedDate]);

  useEffect(() => { loadMeals(); }, [loadMeals]);

  const handleDelete = async (mealId: string, date: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("meals").delete().eq("id", mealId);
    await updateDailySummary(supabase, userId, date);
    loadMeals();
  };

  const mealsByType = (type: typeof MEAL_TYPES[number]) => meals.filter((m) => m.meal_type === type);
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  const MEAL_COLORS: Record<typeof MEAL_TYPES[number], string> = {
    breakfast: "#f59e0b",
    lunch:     "#60a5fa",
    dinner:    "#a78bfa",
    snack:     "#34d399",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center px-3 pt-5 pb-10 md:px-7 md:pt-7 min-h-full">
        <div className="w-full max-w-3xl flex justify-between items-start mb-6">
          <div className="lixum-skeleton h-9 w-36 rounded-2xl" />
          <div className="lixum-skeleton h-9 w-28 rounded-xl" />
        </div>
        <div className="w-full max-w-3xl flex gap-3 mb-5">
          <div className="lixum-skeleton h-10 w-48 rounded-xl" />
          <div className="lixum-skeleton h-10 w-28 rounded-xl" />
        </div>
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0,1,2,3].map((i) => (
            <div key={i} className="lixum-skeleton rounded-[1.75rem]" style={{ height:"11rem" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-3 pt-5 pb-10 md:px-7 md:pt-7 min-h-full">

      {/* ── HEADER ── */}
      <header className="w-full max-w-3xl flex justify-between items-start mb-6 lixum-animate">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
            {t.meals.title}
          </h1>
          <p className="text-sm text-white/50 font-medium mt-0.5">
            {locale === "fr" ? "Suivi nutritionnel du jour" : "Daily nutrition tracking"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/meals/scan`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background:"rgba(0,255,157,.08)",
              border:"1px solid rgba(0,255,157,.20)",
              color:"#00ff9d",
            }}
          >
            <span>📷</span>
            <span className="hidden sm:inline">{t.meals.scanMeal}</span>
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: showForm ? "rgba(239,68,68,.08)" : "rgba(245,158,11,.12)",
              border:`1px solid ${showForm ? "rgba(239,68,68,.25)" : "rgba(245,158,11,.30)"}`,
              color: showForm ? "#f87171" : "#f59e0b",
            }}
          >
            {showForm ? t.common.cancel : t.meals.addMeal}
          </button>
        </div>
      </header>

      {/* ── DATE + TOTAL ── */}
      <div className="w-full max-w-3xl flex items-center gap-3 mb-5 lixum-animate" style={{ animationDelay:".05s" }}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => { setSelectedDate(e.target.value); setLoading(true); }}
          className="lixum-input flex-1"
          style={{ maxWidth:"14rem" }}
        />
        <div
          className="rounded-xl px-4 py-2.5 text-center flex-shrink-0"
          style={{ ...GLASS_CARD }}
        >
          <p className="text-xs text-white/50 font-medium uppercase tracking-wider">{t.dashboard.consumed}</p>
          <p className="lixum-num text-lg font-black text-amber-400">{totalCalories} kcal</p>
        </div>
      </div>

      {/* ── ADD MEAL FORM ── */}
      {showForm && (
        <div
          className="w-full max-w-3xl rounded-[1.5rem] p-5 mb-5 lixum-animate"
          style={GLASS_CARD}
        >
          <AddMealForm
            userId={userId}
            locale={locale}
            t={t}
            onMealAdded={() => { setShowForm(false); loadMeals(); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* ── MEAL TYPE SECTIONS ── */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MEAL_TYPES.map((type, idx) => {
          const typeMeals = mealsByType(type);
          const typeKcal  = typeMeals.reduce((s, m) => s + m.calories, 0);
          const color     = MEAL_COLORS[type];
          return (
            <div
              key={type}
              className="lixum-card rounded-[1.75rem] p-5 flex flex-col lixum-animate"
              style={{ ...GLASS_CARD, animationDelay:`${0.08 + idx * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color }}>
                  {t.meals[type]}
                </h2>
                {typeKcal > 0 && (
                  <span className="lixum-num text-sm font-bold" style={{ color }}>
                    {typeKcal} kcal
                  </span>
                )}
              </div>

              {typeMeals.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">{t.common.noResults}</p>
              ) : (
                <div className="space-y-2">
                  {typeMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5"
                      style={{ background:"rgba(255,255,255,.04)" }}
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="font-semibold text-sm text-white/85 truncate">{meal.name}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          <span className="lixum-num">{meal.calories}</span> kcal
                          {meal.protein > 0 && <span> · P <span className="lixum-num">{meal.protein}</span>g</span>}
                          {meal.carbs   > 0 && <span> · C <span className="lixum-num">{meal.carbs}</span>g</span>}
                          {meal.fat     > 0 && <span> · F <span className="lixum-num">{meal.fat}</span>g</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(meal.id, meal.date)}
                        className="text-red-400/50 hover:text-red-400 text-xs font-bold transition-colors flex-shrink-0"
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
    </div>
  );
}
