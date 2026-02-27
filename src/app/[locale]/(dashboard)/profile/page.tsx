"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getDictionary, isValidLocale } from "@/i18n";
import { GLASS_CARD } from "@/components/lixum/LixumShell";
import { useTheme } from "@/components/lixum/ThemeContext";
import type { UserProfile } from "@/types";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const t      = getDictionary(locale);
  const supabase = createClient();

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [profile,   setProfile]   = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email || "");
      const { data } = await supabase.from("users_profile").select("*").eq("user_id", user.id).single();
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

  const displayName = profile?.full_name || userEmail.split("@")[0];

  if (loading) {
    return (
      <div className="flex flex-col items-center px-3 pt-5 pb-10 md:px-7 md:pt-7 min-h-full">
        <div className="w-full max-w-lg">
          <div className="mb-6">
            <div className="lixum-skeleton h-9 w-36 rounded-2xl mb-2" />
            <div className="lixum-skeleton h-4 w-48 rounded-xl" />
          </div>
          <div className="lixum-skeleton rounded-[1.75rem] mb-5" style={{ height:"12rem" }} />
          <div className="lixum-skeleton rounded-[1.75rem] mb-5" style={{ height:"14rem" }} />
          <div className="lixum-skeleton rounded-[1.75rem]" style={{ height:"12rem" }} />
        </div>
      </div>
    );
  }

  const statRows = profile ? [
    { label: t.dashboard.target, value: `${profile.daily_calorie_target} kcal`, color:"#f59e0b" },
    { label: t.dashboard.bmr,    value: `${Math.round(profile.bmr)} kcal`,      color:"rgba(255,255,255,.80)" },
    { label: t.dashboard.tdee,   value: `${Math.round(profile.tdee)} kcal`,     color:"rgba(255,255,255,.80)" },
    { label: t.onboarding.weight,value: `${profile.weight} kg`,                 color:"#00ff9d" },
    { label: t.onboarding.height,value: `${profile.height} cm`,                 color:"rgba(255,255,255,.80)" },
  ] : [];

  return (
    <div className="flex flex-col items-center px-3 pt-5 pb-10 md:px-7 md:pt-7 min-h-full">
      <div className="w-full max-w-lg">

        {/* ── HEADER ── */}
        <header className="mb-6 lixum-animate">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{t.profile.title}</h1>
          <p className="text-sm text-white/50 font-medium mt-0.5">
            {locale === "fr" ? "Votre espace personnel" : "Your personal space"}
          </p>
        </header>

        {/* ── AVATAR CARD ── */}
        <div
          className="lixum-card rounded-[1.75rem] p-7 flex flex-col items-center mb-5 lixum-animate"
          style={{ animationDelay:".05s", ...GLASS_CARD }}
        >
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{
              background:"rgba(0,255,157,.06)",
              border:"2px solid rgba(0,255,157,.25)",
              boxShadow:"0 0 24px rgba(0,255,157,.15)",
            }}
          >
            <span className="text-4xl select-none">👤</span>
          </div>
          <p className="text-xl font-black text-white tracking-tight">{displayName}</p>
          <p className="text-sm text-white/45 font-medium mt-0.5">{userEmail}</p>
          {profile?.is_premium && (
            <span
              className="mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{
                background:"rgba(245,158,11,.12)",
                border:"1px solid rgba(245,158,11,.30)",
                color:"#f59e0b",
              }}
            >
              Premium
            </span>
          )}
        </div>

        {/* ── STATS CARD ── */}
        {profile && (
          <div
            className="lixum-card rounded-[1.75rem] p-5 mb-5 lixum-animate"
            style={{ animationDelay:".10s", ...GLASS_CARD }}
          >
            <h2 className="text-xs text-white/45 uppercase font-bold tracking-widest mb-4">
              {locale === "fr" ? "Données biométriques" : "Biometric data"}
            </h2>
            <div className="space-y-1">
              {statRows.map((row, i) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center py-3"
                  style={{ borderBottom: i < statRows.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}
                >
                  <span className="text-sm text-white/60 font-medium">{row.label}</span>
                  <span className="lixum-num text-sm font-bold" style={{ color:row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS CARD ── */}
        <div
          className="lixum-card rounded-[1.75rem] p-5 lixum-animate"
          style={{ animationDelay:".15s", ...GLASS_CARD }}
        >
          <h2 className="text-xs text-white/45 uppercase font-bold tracking-widest mb-4">
            {t.profile.settings}
          </h2>

          {/* Language */}
          <div
            className="flex justify-between items-center py-3 mb-3"
            style={{ borderBottom:"1px solid rgba(255,255,255,.05)" }}
          >
            <span className="text-sm text-white/60 font-medium">{t.profile.language}</span>
            <span
              className="text-xs font-black tracking-widest px-2.5 py-1 rounded-lg"
              style={{ background:"rgba(0,255,157,.08)", color:"#00ff9d", border:"1px solid rgba(0,255,157,.20)" }}
            >
              {locale.toUpperCase()}
            </span>
          </div>

          {/* Theme toggle */}
          <div
            className="flex justify-between items-center py-3 mb-3"
            style={{ borderBottom:"1px solid rgba(255,255,255,.05)" }}
          >
            <span className="text-sm text-white/60 font-medium">
              {locale === "fr" ? "Thème" : "Theme"}
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-xs font-black tracking-widest px-3 py-1 rounded-lg transition-all"
              style={{
                background: isDark ? "rgba(255,255,255,.06)"       : "rgba(5,150,80,.09)",
                border:     isDark ? "1px solid rgba(255,255,255,.12)" : "1px solid rgba(5,150,80,.22)",
                color:      isDark ? "rgba(255,255,255,.80)"        : "#047857",
              }}
            >
              <span>{isDark ? "🌙" : "☀️"}</span>
              <span>{isDark ? (locale === "fr" ? "SOMBRE" : "DARK") : (locale === "fr" ? "CLAIR" : "LIGHT")}</span>
            </button>
          </div>

          {/* Edit profile */}
          <Link
            href={`/${locale}/onboarding`}
            className="flex items-center justify-center w-full py-3 rounded-xl mb-3 text-sm font-bold transition-all"
            style={{
              background:"rgba(0,255,157,.10)",
              border:"1px solid rgba(0,255,157,.25)",
              color:"#00ff9d",
            }}
          >
            {t.profile.editProfile}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background:"rgba(239,68,68,.06)",
              border:"1px solid rgba(239,68,68,.20)",
              color:"#f87171",
            }}
          >
            {t.auth.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
