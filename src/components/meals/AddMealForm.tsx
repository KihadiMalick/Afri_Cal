"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { updateDailySummary } from "@/utils/daily-summary";

interface AddMealFormProps {
  userId: string;
  locale: "fr" | "en";
  t: {
    meals: {
      name: string;
      calories: string;
      breakfast: string;
      lunch: string;
      dinner: string;
      snack: string;
      addMeal: string;
      protein: string;
      carbs: string;
      fat: string;
      mealType: string;
      date: string;
    };
    common: {
      cancel: string;
    };
  };
  onMealAdded: () => void;
  onCancel: () => void;
}

export default function AddMealForm({
  userId,
  t,
  onMealAdded,
  onCancel,
}: AddMealFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    meal_type: "lunch" as "breakfast" | "lunch" | "dinner" | "snack",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.calories) return;

    setLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("meals").insert({
      user_id: userId,
      name: form.name,
      calories: parseFloat(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fat: parseFloat(form.fat) || 0,
      meal_type: form.meal_type,
      date: form.date,
    });

    if (!error) {
      await updateDailySummary(supabase, userId, form.date);
      onMealAdded();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.meals.name} *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-field"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.meals.calories} (kcal) *
          </label>
          <input
            type="number"
            value={form.calories}
            onChange={(e) => setForm({ ...form, calories: e.target.value })}
            className="input-field"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.meals.mealType}
          </label>
          <select
            value={form.meal_type}
            onChange={(e) =>
              setForm({
                ...form,
                meal_type: e.target.value as "breakfast" | "lunch" | "dinner" | "snack",
              })
            }
            className="input-field"
          >
            <option value="breakfast">{t.meals.breakfast}</option>
            <option value="lunch">{t.meals.lunch}</option>
            <option value="dinner">{t.meals.dinner}</option>
            <option value="snack">{t.meals.snack}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.meals.protein} (g)
          </label>
          <input
            type="number"
            value={form.protein}
            onChange={(e) => setForm({ ...form, protein: e.target.value })}
            className="input-field"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.meals.carbs} (g)
          </label>
          <input
            type="number"
            value={form.carbs}
            onChange={(e) => setForm({ ...form, carbs: e.target.value })}
            className="input-field"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.meals.fat} (g)
          </label>
          <input
            type="number"
            value={form.fat}
            onChange={(e) => setForm({ ...form, fat: e.target.value })}
            className="input-field"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.meals.date}
        </label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="input-field"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 text-sm"
        >
          {loading ? "..." : t.meals.addMeal}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1 text-sm"
        >
          {t.common.cancel}
        </button>
      </div>
    </form>
  );
}
