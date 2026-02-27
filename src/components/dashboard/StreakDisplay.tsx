"use client";

interface StreakDisplayProps {
  streak: number;
  locale: "fr" | "en";
}

export default function StreakDisplay({ streak, locale }: StreakDisplayProps) {
  return (
    <div className="card text-center">
      <p className="text-sm text-brand-brown-light font-semibold mb-2">
        {locale === "fr" ? "Discipline Streak" : "Discipline Streak"}
      </p>
      <div className="flex items-center justify-center gap-2">
        <span className={`text-3xl ${streak > 0 ? "animate-pulse-warm" : ""}`}>
          {streak > 0 ? "\u{1F525}" : "\u{2744}\u{FE0F}"}
        </span>
        <span className={`text-3xl font-bold ${streak > 0 ? "text-brand-gold" : "text-brand-brown-pale"}`}>
          {streak}
        </span>
      </div>
      <p className="text-xs text-brand-brown-pale mt-1">
        {streak === 0
          ? (locale === "fr" ? "Commencez aujourd'hui !" : "Start today!")
          : streak === 1
            ? (locale === "fr" ? "jour vert" : "green day")
            : (locale === "fr" ? "jours verts consecutifs" : "consecutive green days")}
      </p>
    </div>
  );
}
