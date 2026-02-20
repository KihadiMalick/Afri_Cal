"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { DayStatus } from "@/types";

interface DaySummary {
  date: string;
  status: DayStatus;
  total_calories_consumed: number;
  calorie_target: number;
  calorie_balance: number;
}

interface CalendarViewProps {
  userId: string;
  t: {
    calendar: {
      today: string;
      monthView: string;
    };
    dashboard: {
      consumed: string;
      target: string;
      remaining: string;
    };
  };
  locale: "fr" | "en";
}

const STATUS_COLORS: Record<DayStatus, string> = {
  green: "bg-green-400 text-white",
  red: "bg-red-400 text-white",
  gold: "bg-yellow-400 text-white",
};

const MONTH_NAMES_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAY_NAMES_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarView({ userId, t, locale }: CalendarViewProps) {
  const supabase = createClient();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [summaries, setSummaries] = useState<Record<string, DaySummary>>({});
  const [selectedDay, setSelectedDay] = useState<DaySummary | null>(null);

  const monthNames = locale === "fr" ? MONTH_NAMES_FR : MONTH_NAMES_EN;
  const dayNames = locale === "fr" ? DAY_NAMES_FR : DAY_NAMES_EN;

  const loadSummaries = useCallback(async () => {
    const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const { data } = await supabase
      .from("daily_summary")
      .select("date, status, total_calories_consumed, calorie_target, calorie_balance")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate);

    const map: Record<string, DaySummary> = {};
    (data ?? []).forEach((d: DaySummary) => {
      map[d.date] = d;
    });
    setSummaries(map);
  }, [supabase, userId, currentMonth, currentYear]);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(null);
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  // Monday = 0, Sunday = 6
  let startDay = firstDayOfMonth.getDay() - 1;
  if (startDay < 0) startDay = 6;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
  // Fill remaining cells
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const todayStr = today.toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="btn-secondary text-sm px-3 py-1">
          &larr;
        </button>
        <h2 className="text-lg font-bold text-gray-800">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex gap-2">
          <button onClick={goToToday} className="btn-secondary text-sm px-3 py-1">
            {t.calendar.today}
          </button>
          <button onClick={nextMonth} className="btn-secondary text-sm px-3 py-1">
            &rarr;
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
          {locale === "fr" ? "Sous objectif" : "Under target"}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
          {locale === "fr" ? "Pile objectif" : "On target"}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
          {locale === "fr" ? "Surplus" : "Over target"}
        </span>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day names header */}
        {dayNames.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {name}
          </div>
        ))}

        {/* Calendar cells */}
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-10" />;
          }

          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const summary = summaries[dateStr];
          const isToday = dateStr === todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDay(summary ?? null)}
              className={`h-10 rounded-lg text-sm font-medium transition-colors ${
                summary
                  ? STATUS_COLORS[summary.status as DayStatus]
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } ${isToday ? "ring-2 ring-primary-600 ring-offset-1" : ""}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="card border-l-4 border-l-primary-400">
          <h3 className="font-semibold text-gray-800 mb-2">
            {selectedDay.date}
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div>
              <p className="text-gray-500">{t.dashboard.consumed}</p>
              <p className="font-bold text-gray-800">
                {selectedDay.total_calories_consumed} kcal
              </p>
            </div>
            <div>
              <p className="text-gray-500">{t.dashboard.target}</p>
              <p className="font-bold text-gray-800">
                {selectedDay.calorie_target} kcal
              </p>
            </div>
            <div>
              <p className="text-gray-500">
                {locale === "fr" ? "Bilan" : "Balance"}
              </p>
              <p
                className={`font-bold ${
                  selectedDay.calorie_balance > 0
                    ? "text-red-500"
                    : selectedDay.calorie_balance < 0
                      ? "text-green-500"
                      : "text-yellow-500"
                }`}
              >
                {selectedDay.calorie_balance > 0 ? "+" : ""}
                {selectedDay.calorie_balance} kcal
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
