"use client";

import { useState } from "react";
import type { ScanPipelineResult } from "@/types/vision-pipeline";

interface ScanResultCardProps {
  result: ScanPipelineResult;
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
  const [showDetails, setShowDetails] = useState(false);

  const { nutrition, warnings, detected_meal_name, confidence_score, ingredients, visual_cues, learning_applied } = result;

  const confidencePercent = Math.round(confidence_score * 100);

  const confidenceColor =
    confidence_score >= 0.7
      ? "text-primary-400"
      : confidence_score >= 0.4
      ? "text-accent-400"
      : "text-red-400";

  const confidenceBarColor =
    confidence_score >= 0.7
      ? "bg-primary-500"
      : confidence_score >= 0.4
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
            alt={detected_meal_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-100 truncate">
            {detected_meal_name}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="premium-badge text-[10px]">Scan IA</span>
            {learning_applied && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                Apprentissage
              </span>
            )}
            <span className="text-xs text-dark-100">
              {result.portion_size === "small"
                ? "Petite portion"
                : result.portion_size === "medium"
                ? "Portion moyenne"
                : "Grande portion"}
            </span>
          </div>
        </div>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Calories */}
        <div className="col-span-2 bg-gradient-to-r from-primary-600/10 to-primary-500/5 border border-primary-500/20 rounded-xl p-4 text-center">
          <p className="text-xs text-dark-100 mb-1">Calories totales</p>
          <p className="text-3xl font-bold text-primary-400">
            {nutrition.total_kcal}
          </p>
          <p className="text-[10px] text-dark-200">kcal</p>
        </div>

        {/* Macros */}
        <div className="bg-dark-700 rounded-xl p-3 text-center">
          <p className="text-[10px] text-dark-200 mb-0.5">Proteines</p>
          <p className="text-lg font-bold text-blue-400">
            {nutrition.total_protein}g
          </p>
        </div>
        <div className="bg-dark-700 rounded-xl p-3 text-center">
          <p className="text-[10px] text-dark-200 mb-0.5">Glucides</p>
          <p className="text-lg font-bold text-amber-400">
            {nutrition.total_carbs}g
          </p>
        </div>
        <div className="bg-dark-700 rounded-xl p-3 text-center">
          <p className="text-[10px] text-dark-200 mb-0.5">Lipides</p>
          <p className="text-lg font-bold text-orange-400">
            {nutrition.total_fat}g
          </p>
        </div>
        <div className="bg-dark-700 rounded-xl p-3 text-center">
          <p className="text-[10px] text-dark-200 mb-0.5">Poids</p>
          <p className="text-lg font-bold text-gray-100">
            {nutrition.total_weight}g
          </p>
        </div>
      </div>

      {/* Visual cues */}
      {visual_cues && visual_cues.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visual_cues.map((cue, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-full bg-dark-600 text-dark-100 border border-dark-500"
            >
              {cue}
            </span>
          ))}
        </div>
      )}

      {/* Confidence */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-dark-100">Confiance</span>
        <div className="flex-1 bg-dark-500 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${confidenceBarColor}`}
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
        <span className={`text-sm font-bold ${confidenceColor}`}>
          {confidencePercent}%
        </span>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 text-xs ${
                w.severity === "error"
                  ? "bg-red-500/10 border border-red-500/20 text-red-400"
                  : w.severity === "warning"
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                  : "bg-blue-500/10 border border-blue-500/20 text-blue-400"
              }`}
            >
              {w.message}
            </div>
          ))}
        </div>
      )}

      {/* Ingredients list */}
      <div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full text-left"
        >
          <p className="text-xs text-dark-100 font-medium uppercase tracking-wide">
            Ingredients detectes ({ingredients.length})
          </p>
          <span className="text-dark-200 text-xs">
            {showDetails ? "Masquer" : "Details"}
          </span>
        </button>

        {/* Quick tags */}
        {!showDetails && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ingredients.map((ing, i) => (
              <span
                key={i}
                className={`text-xs px-2.5 py-1 rounded-lg border ${
                  ing.match_type === "exact"
                    ? "bg-primary-500/10 text-primary-300 border-primary-500/20"
                    : ing.match_type === "fuzzy"
                    ? "bg-accent-500/10 text-accent-300 border-accent-500/20"
                    : ing.match_type === "learned"
                    ? "bg-green-500/10 text-green-300 border-green-500/20"
                    : "bg-dark-700 text-dark-100 border-dark-500"
                }`}
              >
                {ing.original_detected_name}
              </span>
            ))}
          </div>
        )}

        {/* Detailed per-ingredient table */}
        {showDetails && (
          <div className="mt-3 space-y-2">
            {nutrition.per_ingredient.map((ing, i) => (
              <div
                key={i}
                className="bg-dark-700 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-100 truncate">
                    {ing.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-dark-200">
                      {ing.weight_grams}g
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        ing.match_type === "exact"
                          ? "bg-primary-500/20 text-primary-300"
                          : ing.match_type === "fuzzy"
                          ? "bg-accent-500/20 text-accent-300"
                          : ing.match_type === "learned"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-dark-500 text-dark-200"
                      }`}
                    >
                      {ing.match_type === "exact"
                        ? "Exact"
                        : ing.match_type === "fuzzy"
                        ? "Similaire"
                        : ing.match_type === "learned"
                        ? "Appris"
                        : ing.match_type === "category_fallback"
                        ? "Categorie"
                        : "Estime"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary-400">
                    {ing.kcal} kcal
                  </p>
                  <p className="text-[10px] text-dark-200">
                    P{ing.protein} G{ing.carbs} L{ing.fat}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
