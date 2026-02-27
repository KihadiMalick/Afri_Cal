"use client";

import { getScoreColor } from "@/utils/daily-score";

interface ScoreCardProps {
  score: number;
  locale: "fr" | "en";
}

export default function ScoreCard({ score, locale }: ScoreCardProps) {
  const color = getScoreColor(score);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="card text-center">
      <p className="text-sm text-brand-brown-light font-semibold mb-3">
        {locale === "fr" ? "Score du jour" : "Today's Score"}
      </p>
      <div className="relative inline-flex items-center justify-center">
        <svg width="100" height="100" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#EDE8D0"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <p className="text-xs text-brand-brown-pale mt-2">/ 100</p>
    </div>
  );
}
