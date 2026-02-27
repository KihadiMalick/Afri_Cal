"use client";

interface DataPoint {
  date: string;
  consumed: number;
  target: number;
}

interface CaloriesChartProps {
  data: DataPoint[];
  locale: "fr" | "en";
}

export default function CaloriesChart({ data, locale }: CaloriesChartProps) {
  if (data.length === 0) {
    return (
      <div className="empty-state">
        {locale === "fr" ? "Pas encore de donnees" : "No data yet"}
      </div>
    );
  }

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.consumed, d.target)),
    1
  );
  const svgW = 600;
  const svgH = 200;
  const padding = { top: 10, right: 10, bottom: 30, left: 10 };
  const chartW = svgW - padding.left - padding.right;
  const chartH = svgH - padding.top - padding.bottom;

  const xStep = chartW / Math.max(data.length - 1, 1);

  const toY = (val: number) =>
    padding.top + chartH - (val / maxVal) * chartH;

  const consumedPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${padding.left + i * xStep} ${toY(d.consumed)}`)
    .join(" ");

  const targetPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${padding.left + i * xStep} ${toY(d.target)}`)
    .join(" ");

  // Area under consumed line
  const areaPath = `${consumedPath} L ${padding.left + (data.length - 1) * xStep} ${toY(0)} L ${padding.left} ${toY(0)} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D98E4F" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#D98E4F" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Target line (dashed gold) */}
        <path
          d={targetPath}
          fill="none"
          stroke="#303F9F"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.7"
        />

        {/* Consumed line (green) */}
        <path
          d={consumedPath}
          fill="none"
          stroke="#D98E4F"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={d.date}
            cx={padding.left + i * xStep}
            cy={toY(d.consumed)}
            r="3"
            fill="#D98E4F"
            stroke="#F7F4E8"
            strokeWidth="1.5"
          />
        ))}

        {/* X axis labels (every 5 days) */}
        {data.map((d, i) => {
          if (i % 5 !== 0 && i !== data.length - 1) return null;
          const label = d.date.slice(5); // "MM-DD"
          return (
            <text
              key={`label-${d.date}`}
              x={padding.left + i * xStep}
              y={svgH - 5}
              textAnchor="middle"
              fill="#A67860"
              fontSize="10"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs text-brand-brown-light">
        <span className="flex items-center gap-1">
          <span className="w-3 h-[2px] bg-brand-terracotta inline-block" />
          {locale === "fr" ? "Consomme" : "Consumed"}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-[2px] bg-brand-indigo inline-block border-dashed" style={{ borderTopWidth: 2, borderStyle: "dashed" }} />
          {locale === "fr" ? "Objectif" : "Target"}
        </span>
      </div>
    </div>
  );
}
