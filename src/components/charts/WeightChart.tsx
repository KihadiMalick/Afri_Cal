"use client";

interface WeightDataPoint {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data: WeightDataPoint[];
  locale: "fr" | "en";
}

export default function WeightChart({ data, locale }: WeightChartProps) {
  if (data.length === 0) {
    return (
      <div className="empty-state">
        {locale === "fr" ? "Pas encore de donnees" : "No data yet"}
      </div>
    );
  }

  const weights = data.map((d) => d.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const range = maxW - minW || 1;

  const svgW = 600;
  const svgH = 200;
  const padding = { top: 15, right: 10, bottom: 30, left: 40 };
  const chartW = svgW - padding.left - padding.right;
  const chartH = svgH - padding.top - padding.bottom;

  const xStep = chartW / Math.max(data.length - 1, 1);

  const toY = (val: number) =>
    padding.top + chartH - ((val - minW) / range) * chartH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${padding.left + i * xStep} ${toY(d.weight)}`)
    .join(" ");

  const areaPath = `${linePath} L ${padding.left + (data.length - 1) * xStep} ${toY(minW)} L ${padding.left} ${toY(minW)} Z`;

  // Trend direction
  const firstW = data[0].weight;
  const lastW = data[data.length - 1].weight;
  const trendColor = lastW < firstW ? "#10b981" : lastW > firstW ? "#ef4444" : "#fbbf24";

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto">
        <defs>
          <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trendColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const val = minW + pct * range;
          const y = toY(val);
          return (
            <g key={`y-${pct}`}>
              <line x1={padding.left} y1={y} x2={svgW - padding.right} y2={y}
                stroke="#2a2a32" strokeWidth="1" />
              <text x={padding.left - 5} y={y + 4} textAnchor="end" fill="#7a7a88" fontSize="10">
                {Math.round(val * 10) / 10}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaPath} fill="url(#weightAreaGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={trendColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {data.map((d, i) => (
          <circle
            key={d.date}
            cx={padding.left + i * xStep}
            cy={toY(d.weight)}
            r="3.5"
            fill={trendColor}
            stroke="#1a1a1f"
            strokeWidth="1.5"
          />
        ))}

        {/* X axis labels */}
        {data.map((d, i) => {
          if (data.length > 10 && i % 5 !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={`xl-${d.date}`}
              x={padding.left + i * xStep}
              y={svgH - 5}
              textAnchor="middle"
              fill="#7a7a88"
              fontSize="10"
            >
              {d.date.slice(5)}
            </text>
          );
        })}
      </svg>

      <div className="flex justify-between text-xs text-dark-100 mt-1">
        <span>{locale === "fr" ? "Debut" : "Start"}: {firstW} kg</span>
        <span>{locale === "fr" ? "Actuel" : "Current"}: {lastW} kg</span>
      </div>
    </div>
  );
}
