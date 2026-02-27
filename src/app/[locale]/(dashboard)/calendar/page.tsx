"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { getDictionary, isValidLocale } from "@/i18n";
import CalendarView from "@/components/calendar/CalendarView";
import { GLASS_CARD } from "@/components/lixum/LixumShell";

export default function CalendarPage() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const t      = getDictionary(locale);
  const supabase = createClient();

  const [userId,  setUserId]  = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push(`/${locale}/login`); return; }
      setUserId(user.id);
      setLoading(false);
    }
    loadUser();
  }, [supabase, router, locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="lixum-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-3 pt-5 pb-10 md:px-7 md:pt-7 min-h-full">

      {/* ── HEADER ── */}
      <header className="w-full max-w-3xl mb-6 lixum-animate">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{t.calendar.title}</h1>
        <p className="text-sm text-white/50 font-medium mt-0.5">
          {locale === "fr" ? "Historique de vos journées nutritionnelles" : "Your nutritional history"}
        </p>
      </header>

      {/* ── CALENDAR VIEW ── */}
      <div
        className="lixum-card w-full max-w-3xl rounded-[1.75rem] p-4 md:p-6 lixum-animate"
        style={{ animationDelay:".05s", ...GLASS_CARD }}
      >
        <CalendarView userId={userId} t={t} locale={locale} />
      </div>
    </div>
  );
}
