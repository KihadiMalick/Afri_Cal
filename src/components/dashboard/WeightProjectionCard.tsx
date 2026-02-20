"use client";

interface WeightProjectionCardProps {
  currentWeight: number;
  projectedWeight: number;
  weightChange: number;
  locale: "fr" | "en";
}

export default function WeightProjectionCard({
  currentWeight,
  projectedWeight,
  weightChange,
  locale,
}: WeightProjectionCardProps) {
  const isLoss = weightChange < 0;
  const isGain = weightChange > 0;

  return (
    <div className="card">
      <p className="text-sm text-dark-100 mb-3">
        {locale === "fr" ? "Projection 30 jours" : "30-Day Projection"}
      </p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-dark-200">
            {locale === "fr" ? "Actuel" : "Current"}
          </p>
          <p className="text-lg font-bold text-gray-100">{currentWeight}</p>
          <p className="text-xs text-dark-200">kg</p>
        </div>
        <div className="flex items-center justify-center">
          <span className={`text-2xl ${isLoss ? "text-primary-400" : isGain ? "text-red-400" : "text-accent-400"}`}>
            {isLoss ? "\u{2198}\u{FE0F}" : isGain ? "\u{2197}\u{FE0F}" : "\u{27A1}\u{FE0F}"}
          </span>
        </div>
        <div>
          <p className="text-xs text-dark-200">
            {locale === "fr" ? "Estime" : "Estimated"}
          </p>
          <p className={`text-lg font-bold ${isLoss ? "text-primary-400" : isGain ? "text-red-400" : "text-accent-400"}`}>
            {projectedWeight}
          </p>
          <p className="text-xs text-dark-200">kg</p>
        </div>
      </div>
      <p className={`text-xs text-center mt-2 ${isLoss ? "text-primary-400" : isGain ? "text-red-400" : "text-dark-200"}`}>
        {weightChange > 0 ? "+" : ""}{weightChange} kg {locale === "fr" ? "en 30 jours" : "in 30 days"}
      </p>
    </div>
  );
}
