"use client";

import type { ScanResult } from "@/types";

interface ScanResultCardProps {
  result: ScanResult;
  imagePreview: string;
  onCorrect: () => void;
  onAddMeal: () => void;
  onNewScan: () => void;
}

export default function ScanResultCard({
  result,
  imagePreview,
  onCorrect,
  onAddMeal,
  onNewScan,
}: ScanResultCardProps) {
  const finalCalories = result.adjusted_calories ?? result.estimated_calories;
  const confidencePercent = Math.round(result.confidence * 100);

  const confidenceColor =
    result.confidence >= 0.8
      ? "text-primary-400"
      : result.confidence >= 0.5
      ? "text-accent-400"
      : "text-red-400";

  const confidenceBarColor =
    result.confidence >= 0.8
      ? "bg-primary-500"
      : result.confidence >= 0.5
      ? "bg-accent-500"
      : "bg-red-500";

  return (
    <div className="card animate-scale-in space-y-5">
      {/* Image + dish name header */}
      <div className="flex gap-4 items-start">
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-dark-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt={result.dish_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-100 truncate">
            {result.dish_name}
          </h3>
          {result.matched_african_dish && (
            <div className="flex items-center gap-2 mt-1">
              <span className="premium-badge text-[10px]">Base AfriCalo</span>
              <span className="text-xs text-dark-100">
                {result.matched_african_dish}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dark-700 rounded-xl p-3 text-center">
          <p className="text-xs text-dark-100 mb-1">Calories</p>
          <p className="text-xl font-bold text-primary-400">
            {Math.round(finalCalories)}
          </p>
          <p className="text-[10px] text-dark-200">kcal</p>
        </div>

        <div className="bg-dark-700 rounded-xl p-3 text-center">
          <p className="text-xs text-dark-100 mb-1">Poids</p>
          <p className="text-xl font-bold text-gray-100">
            {result.estimated_weight_grams}
          </p>
          <p className="text-[10px] text-dark-200">grammes</p>
        </div>

        <div className="bg-dark-700 rounded-xl p-3 text-center">
          <p className="text-xs text-dark-100 mb-1">Confiance</p>
          <p className={`text-xl font-bold ${confidenceColor}`}>
            {confidencePercent}%
          </p>
          <div className="w-full bg-dark-500 rounded-full h-1 mt-1.5">
            <div
              className={`h-1 rounded-full transition-all duration-500 ${confidenceBarColor}`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ingredients */}
      {result.ingredients.length > 0 && (
        <div>
          <p className="text-xs text-dark-100 mb-2 font-medium uppercase tracking-wide">
            Ingrédients détectés
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.ingredients.map((ingredient, i) => (
              <span
                key={i}
                className="bg-dark-700 text-dark-100 text-xs px-2.5 py-1 rounded-lg border border-dark-500"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Adjusted calories note */}
      {result.matched_african_dish && result.adjusted_calories && (
        <div className="bg-primary-600/10 border border-primary-500/20 rounded-xl p-3">
          <p className="text-xs text-primary-300">
            <span className="font-semibold">&#x2728; Ajusté via base AfriCalo</span>
            {" "}&#x2014; Calories recalculées à partir de notre base de plats africains
            ({result.estimated_calories} &#x2192; {result.adjusted_calories} kcal)
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-2.5 pt-2">
        <button onClick={onAddMeal} className="btn-primary w-full text-center">
          Ajouter comme repas
        </button>
        <div className="flex gap-2.5">
          <button onClick={onCorrect} className="btn-accent flex-1 text-center text-sm">
            Corriger
          </button>
          <button onClick={onNewScan} className="btn-secondary flex-1 text-center text-sm">
            Nouveau scan
          </button>
        </div>
      </div>
    </div>
  );
}
