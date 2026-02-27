"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

interface AddWeightFormProps {
  userId: string;
  locale: "fr" | "en";
  onWeightAdded: () => void;
}

export default function AddWeightForm({ userId, locale, onWeightAdded }: AddWeightFormProps) {
  const supabase = createClient();
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    setLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("weight_logs").upsert(
      { user_id: userId, weight: parseFloat(weight), date },
      { onConflict: "user_id,date" }
    );

    setWeight("");
    setLoading(false);
    onWeightAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="block text-xs font-medium text-brand-brown-light mb-1">
          {locale === "fr" ? "Poids (kg)" : "Weight (kg)"}
        </label>
        <input
          type="number"
          step="0.1"
          min="20"
          max="500"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="input-field text-sm py-2"
          placeholder="70.5"
          required
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-brand-brown-light mb-1">
          {locale === "fr" ? "Date" : "Date"}
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field text-sm py-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary text-sm py-2 px-4 whitespace-nowrap"
      >
        {loading ? "..." : (locale === "fr" ? "Ajouter" : "Add")}
      </button>
    </form>
  );
}
