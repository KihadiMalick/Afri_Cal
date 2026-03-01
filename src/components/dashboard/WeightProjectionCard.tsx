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
      <p className="text-sm text-brand-brown-light mb-3">
        {locale === "fr" ? "Projection 30 jours" : "30-Day Projection"}
      </p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-brand-brown-pale">
            {locale === "fr" ? "Actuel" : "Current"}
          </p>
          <p className="text-lg font-bold text-brand-brown-dark">{currentWeight}</p>
          <p className="text-xs text-brand-brown-pale">kg</p>
        </div>
        <div className="flex items-center justify-center">
          <span className={`text-2xl ${isLoss ? "text-brand-terracotta" : isGain ? "text-red-400" : "text-brand-gold"}`}>
            {isLoss ? "\u{2198}\u{FE0F}" : isGain ? "\u{2197}\u{FE0F}" : "\u{27A1}\u{FE0F}"}
          </span>
        </div>
        <div>
          <p className="text-xs text-brand-brown-pale">
            {locale === "fr" ? "Estime" : "Estimated"}
          </p>
          <p className={`text-lg font-bold ${isLoss ? "text-brand-terracotta" : isGain ? "text-red-400" : "text-brand-gold"}`}>
            {projectedWeight}
          </p>
          <p className="text-xs text-brand-brown-pale">kg</p>
        </div>
      </div>
      <p className={`text-xs text-center mt-2 ${isLoss ? "text-brand-terracotta" : isGain ? "text-red-400" : "text-brand-brown-pale"}`}>
        {weightChange > 0 ? "+" : ""}{weightChange} kg {locale === "fr" ? "en 30 jours" : "in 30 days"}
      </p>
    </div>
  );
}
