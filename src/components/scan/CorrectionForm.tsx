"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import type { ScanPipelineResult, MatchedIngredient } from "@/types/vision-pipeline";
import { adjustIngredientsManually } from "@/lib/vision-pipeline";
import { saveCorrection } from "@/lib/learning";

interface CorrectionFormProps {
  scanId: string;
  userId: string;
  imageHash: string | null;
  result: ScanPipelineResult;
  onCorrected: (updatedResult: ScanPipelineResult) => void;
  onCancel: () => void;
}

export default function CorrectionForm({
  scanId,
  userId,
  imageHash,
  result,
  onCorrected,
  onCancel,
}: CorrectionFormProps) {
  const [dishName, setDishName] = useState(result.detected_meal_name);
  const [ingredients, setIngredients] = useState<MatchedIngredient[]>(
    () => result.ingredients.map((i) => ({ ...i }))
  );
  const [saving, setSaving] = useState(false);
  const [newIngName, setNewIngName] = useState("");
  const [newIngGrams, setNewIngGrams] = useState(50);
  const [newIngKcal, setNewIngKcal] = useState(100);

  const supabase = createClient();

  function handleWeightChange(index: number, newWeight: number) {
    setIngredients((prev) =>
      prev.map((ing, i) =>
        i === index ? { ...ing, matched_weight_grams: Math.max(1, newWeight) } : ing
      )
    );
  }

  function handleRemoveIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddIngredient() {
    if (!newIngName.trim()) return;

    const newIngredient: MatchedIngredient = {
      ingredient_id: null,
      name: newIngName.trim(),
      original_detected_name: newIngName.trim(),
      kcal_per_100g: newIngKcal,
      protein_per_100g: 5,
      carbs_per_100g: 15,
      fat_per_100g: 3,
      fiber_per_100g: 1,
      matched_weight_grams: newIngGrams,
      match_type: "approximate_estimation",
      match_confidence: 0.5,
    };

    setIngredients((prev) => [...prev, newIngredient]);
    setNewIngName("");
    setNewIngGrams(50);
    setNewIngKcal(100);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const updatedResult = adjustIngredientsManually(
      { ...result, detected_meal_name: dishName },
      ingredients
    );
    updatedResult.detected_meal_name = dishName;

    // Save correction with full original + corrected data for learning
    await saveCorrection(supabase, {
      userId,
      scanId: scanId || null,
      originalDetection: result.detection_raw,
      correctedDishName: dishName,
      correctedIngredients: ingredients,
      imageHash,
    });

    onCorrected(updatedResult);
    setSaving(false);
  }

  // Live preview of recalculated values
  const preview = adjustIngredientsManually(result, ingredients);

  return (
    <div className="card animate-scale-in space-y-4">
      <h3 className="text-lg font-bold text-gray-100">
        Corriger le resultat
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dish name */}
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

        {/* Ingredients list */}
        <div>
          <label className="block text-sm font-medium text-dark-100 mb-2">
            Ingredients ({ingredients.length})
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {ingredients.map((ing, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-dark-700 rounded-xl p-2.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-100 truncate">{ing.name}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={ing.matched_weight_grams}
                    onChange={(e) =>
                      handleWeightChange(i, Number(e.target.value))
                    }
                    className="w-16 text-sm text-center bg-dark-600 border border-dark-500 rounded-lg px-1 py-1 text-gray-100"
                    min={1}
                    max={2000}
                  />
                  <span className="text-xs text-dark-200">g</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(i)}
                    className="ml-1 w-6 h-6 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
                  >
                    &#x2715;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add new ingredient */}
        <div className="bg-dark-700 rounded-xl p-3 space-y-2">
          <p className="text-xs text-dark-100 font-medium">
            Ajouter un ingredient
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newIngName}
              onChange={(e) => setNewIngName(e.target.value)}
              placeholder="Nom..."
              className="flex-1 text-sm bg-dark-600 border border-dark-500 rounded-lg px-2 py-1.5 text-gray-100 placeholder-dark-300"
            />
            <input
              type="number"
              value={newIngGrams}
              onChange={(e) => setNewIngGrams(Number(e.target.value))}
              className="w-16 text-sm text-center bg-dark-600 border border-dark-500 rounded-lg px-1 py-1.5 text-gray-100"
              min={1}
              placeholder="g"
            />
            <input
              type="number"
              value={newIngKcal}
              onChange={(e) => setNewIngKcal(Number(e.target.value))}
              className="w-20 text-sm text-center bg-dark-600 border border-dark-500 rounded-lg px-1 py-1.5 text-gray-100"
              min={0}
              placeholder="kcal/100g"
            />
          </div>
          <button
            type="button"
            onClick={handleAddIngredient}
            disabled={!newIngName.trim()}
            className="text-xs text-primary-400 hover:text-primary-300 disabled:text-dark-300 transition-colors"
          >
            + Ajouter
          </button>
        </div>

        {/* Live preview */}
        <div className="bg-primary-600/10 border border-primary-500/20 rounded-xl p-3">
          <p className="text-xs text-primary-300 font-semibold mb-2">
            Apercu recalcule
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-primary-400">
                {preview.nutrition.total_kcal}
              </p>
              <p className="text-[10px] text-dark-200">kcal</p>
            </div>
            <div>
              <p className="text-sm font-bold text-blue-400">
                {preview.nutrition.total_protein}g
              </p>
              <p className="text-[10px] text-dark-200">prot</p>
            </div>
            <div>
              <p className="text-sm font-bold text-amber-400">
                {preview.nutrition.total_carbs}g
              </p>
              <p className="text-[10px] text-dark-200">gluc</p>
            </div>
            <div>
              <p className="text-sm font-bold text-orange-400">
                {preview.nutrition.total_fat}g
              </p>
              <p className="text-[10px] text-dark-200">lip</p>
            </div>
          </div>
        </div>

        {/* Actions */}
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
