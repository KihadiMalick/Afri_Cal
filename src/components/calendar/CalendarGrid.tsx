"use client";

interface CalendarGridProps {
  locale: string;
}

export default function CalendarGrid({ locale: _locale }: CalendarGridProps) {
  // TODO: Implement interactive monthly calendar in Phase 2
  return (
    <div className="card">
      <div className="grid grid-cols-7 gap-1 text-center">
        {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
          <div key={i} className="text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        {Array.from({ length: 35 }, (_, i) => (
          <div
            key={i}
            className="aspect-square flex items-center justify-center rounded-xl text-sm text-gray-400 hover:bg-primary-50 cursor-pointer transition-colors"
          >
            {i + 1 <= 31 ? i + 1 : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
