"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getDictionary, isValidLocale } from "@/i18n";
import type { UserProfile } from "@/types";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const t = getDictionary(locale);
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email || "");

      const { data } = await supabase
        .from("users_profile")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) setProfile(data as UserProfile);
      setLoading(false);
    }

    loadProfile();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t.profile.title}</h1>

      {/* Profile card */}
      <div className="card flex flex-col items-center py-8">
        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
          <span className="text-3xl">&#x1F464;</span>
        </div>
        <p className="font-semibold text-gray-900">
          {profile?.full_name || userEmail.split("@")[0]}
        </p>
        <p className="text-gray-400 text-sm">{userEmail}</p>
      </div>

      {/* Stats */}
      {profile && (
        <div className="card space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">{t.dashboard.target}</span>
            <span className="font-semibold text-primary-600">{profile.daily_calorie_target} kcal</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">{t.dashboard.bmr}</span>
            <span className="font-medium">{Math.round(profile.bmr)} kcal</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">{t.dashboard.tdee}</span>
            <span className="font-medium">{Math.round(profile.tdee)} kcal</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">{t.onboarding.weight}</span>
            <span className="font-medium">{profile.weight} kg</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">{t.onboarding.height}</span>
            <span className="font-medium">{profile.height} cm</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {t.profile.settings}
        </h2>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">{t.profile.language}</span>
          <span className="text-gray-400 text-sm">{locale.toUpperCase()}</span>
        </div>

        <Link href={`/${locale}/onboarding`} className="btn-primary w-full block text-center">
          {t.profile.editProfile}
        </Link>
        <button
          onClick={handleLogout}
          className="btn-secondary w-full text-red-500 border-red-200 hover:bg-red-50"
        >
          {t.auth.logout}
        </button>
      </div>
    </div>
  );
}
