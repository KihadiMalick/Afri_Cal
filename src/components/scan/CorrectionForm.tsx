"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import type { ScanResult } from "@/types";

interface CorrectionFormProps {
  scanId: string;
  result: ScanResult;
  onCorrected: (correctedCalories: number, correctedDish: string) => void;
  onCancel: () => void;
}

export default function CorrectionForm({
  scanId,
  result,
  onCorrected,
  onCancel,
}: CorrectionFormProps) {
  const finalCalories = result.adjusted_calories ?? result.estimated_calories;
  const [dishName, setDishName] = useState(result.dish_name);
  const [calories, setCalories] = useState(Math.round(finalCalories));
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("scan_corrections").insert({
      scan_id: scanId,
      corrected_dish: dishName,
      corrected_calories: calories,
    });

    onCorrected(calories, dishName);
    setSaving(false);
  }

  return (
    <div className="card animate-scale-in">
      <h3 className="text-lg font-bold text-gray-100 mb-4">
        Corriger le résultat
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-100 mb-1">
            Nom du plat
          </label>
          <input
            type="text"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-100 mb-1">
            Calories (kcal)
          </label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            className="input-field"
            min={0}
            max={5000}
            required
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 text-center"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1 text-center"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
