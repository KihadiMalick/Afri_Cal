"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getDictionary, type Locale } from "@/i18n";

interface RegisterFormProps {
  locale: Locale;
}

export default function RegisterForm({ locale }: RegisterFormProps) {
  const t = getDictionary(locale);
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(locale === "fr" ? "Les mots de passe ne correspondent pas" : "Passwords do not match");
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // After signup, redirect to onboarding
    router.push(`/${locale}/onboarding`);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError("");
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/${locale}/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-2xl border border-red-500/20">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-dark-100 mb-1">
          {t.auth.email}
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          placeholder={t.auth.email}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-dark-100 mb-1">
          {t.auth.password}
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder={t.auth.password}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-100 mb-1">
          {t.auth.confirmPassword}
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-field"
          placeholder={t.auth.confirmPassword}
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? t.common.loading : t.auth.register}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-500" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-dark-800 text-dark-200">
            {locale === "fr" ? "ou" : "or"}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="btn-secondary w-full"
      >
        {t.auth.googleLogin}
      </button>

      <p className="text-center text-sm text-dark-100 mt-4">
        {t.auth.hasAccount}{" "}
        <Link
          href={`/${locale}/login`}
          className="text-primary-400 font-medium hover:text-accent-400"
        >
          {t.auth.login}
        </Link>
      </p>
    </form>
  );
}
