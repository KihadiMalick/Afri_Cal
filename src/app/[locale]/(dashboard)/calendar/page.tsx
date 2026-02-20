"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { getDictionary, isValidLocale } from "@/i18n";
import CalendarView from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string)
    ? (params.locale as "fr" | "en")
    : "fr";
  const t = getDictionary(locale);
  const supabase = createClient();

  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }
      setUserId(user.id);
      setLoading(false);
    }
    loadUser();
  }, [supabase, router, locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-gray-100">{t.calendar.title}</h1>
      <div className="card-static">
        <CalendarView userId={userId} t={t} locale={locale} />
      </div>
    </div>
  );
}
