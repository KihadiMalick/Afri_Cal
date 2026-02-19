"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getDictionary, isValidLocale } from "@/i18n";
import type { UserProfile } from "@/types";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const t = getDictionary(locale);
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }

      setUserEmail(user.email || "");

      const { data } = await supabase
        .from("users_profile")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile(data as UserProfile);
      }
      setLoading(false);
    }

    loadProfile();
  }, [supabase, router, locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  // If no profile yet, show onboarding CTA
  if (!profile || !profile.onboarding_completed) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t.dashboard.welcome}, {userEmail.split("@")[0]}
        </h1>
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-6">{t.dashboard.completeOnboarding}</p>
          <Link href={`/${locale}/onboarding`} className="btn-primary">
            {t.dashboard.goToOnboarding}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {t.dashboard.welcome}, {profile.full_name || userEmail.split("@")[0]}
      </h1>

      {/* Calorie Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.target}</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {profile.daily_calorie_target}
          </p>
          <p className="text-xs text-gray-400">{t.dashboard.kcalPerDay}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.consumed}</p>
          <p className="text-2xl font-bold text-accent-500 mt-1">0</p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.burned}</p>
          <p className="text-2xl font-bold text-green-500 mt-1">0</p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.remaining}</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">
            {profile.daily_calorie_target}
          </p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
      </div>

      {/* BMR / TDEE info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.bmr}</p>
          <p className="text-xl font-bold text-gray-700 mt-1">
            {Math.round(profile.bmr)}
          </p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.tdee}</p>
          <p className="text-xl font-bold text-gray-700 mt-1">
            {Math.round(profile.tdee)}
          </p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t.meals.title}
          </h2>
          <p className="text-gray-400 text-sm">{t.common.noResults}</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t.activities.title}
          </h2>
          <p className="text-gray-400 text-sm">{t.common.noResults}</p>
        </div>
      </div>
    </div>
  );
}
