"use client";

import type { Badge } from "@/types";

interface BadgesDisplayProps {
  badges: Badge[];
  locale: "fr" | "en";
}

export default function BadgesDisplay({ badges, locale }: BadgesDisplayProps) {
  return (
    <div className="card">
      <p className="text-sm text-brand-brown-light font-semibold mb-4">
        {locale === "fr" ? "Badges" : "Badges"}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-2xl p-3 text-center transition-all duration-300 ${
              badge.unlocked
                ? "bg-brand-gold/20 border border-brand-gold/30 shadow-glow-gold"
                : "bg-brand-cream-dark border border-brand-brown-pale/25 opacity-50"
            }`}
          >
            <span className="text-2xl block mb-1">{badge.icon}</span>
            <p className={`text-xs font-semibold ${badge.unlocked ? "text-brand-gold-dark" : "text-brand-brown-pale"}`}>
              {locale === "fr" ? badge.nameFr : badge.name}
            </p>
            <p className="text-[10px] text-brand-brown-pale mt-0.5">
              {badge.days} {locale === "fr" ? "jours" : "days"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
