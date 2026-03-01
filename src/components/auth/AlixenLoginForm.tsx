"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { type Locale } from "@/i18n";
import { Mail, Lock, ChevronRight } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   ALIXEN LOGIN — LIXUM style dark + cyberpunk
   ═══════════════════════════════════════════════════════════ */

export default function AlixenLoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError("");
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/${locale}/callback` },
    });
    if (authError) setError(authError.message);
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 min-h-screen flex flex-col justify-center">

      {/* ── ALIXEN avatar ── */}
      <div className="flex flex-col items-center mb-4">
        <div
          className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-2"
          style={{
            background: "linear-gradient(135deg, rgba(0,255,157,0.12), rgba(0,180,120,0.06))",
            border: "1px solid rgba(0,255,157,0.25)",
            boxShadow: "0 0 30px rgba(0,255,157,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <ellipse cx="22" cy="24" rx="10" ry="12" fill="rgba(255,255,255,0.90)" />
            <circle cx="22" cy="13" r="7" fill="rgba(255,255,255,0.95)" />
            <circle cx="24" cy="12" r="1.5" fill="#020c07" />
            <circle cx="24.5" cy="11.5" r="0.5" fill="#00ff9d" />
            <path d="M27 14 L31 13.5 L27 15 Z" fill="#f59e0b" />
            <path d="M18 8 Q20 3 22 6 Q24 3 26 8" stroke="#00ff9d" strokeWidth="1.2" fill="none" />
            <path d="M22 36 Q12 32 8 26" stroke="rgba(0,255,157,0.6)" strokeWidth="1" fill="none" />
            <path d="M22 36 Q32 32 36 26" stroke="rgba(0,255,157,0.6)" strokeWidth="1" fill="none" />
            <circle cx="9" cy="26" r="2" fill="rgba(0,255,157,0.3)" stroke="rgba(0,255,157,0.5)" strokeWidth="0.5" />
            <circle cx="35" cy="26" r="2" fill="rgba(0,255,157,0.3)" stroke="rgba(0,255,157,0.5)" strokeWidth="0.5" />
            <rect x="17" y="20" rx="2" ry="2" width="10" height="8" fill="rgba(100,100,110,0.7)" />
            <text x="19" y="27" fill="#00ff9d" fontSize="5" fontWeight="900" fontFamily="monospace">LX</text>
          </svg>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-2 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,157,0.25), transparent)", filter: "blur(2px)" }} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(0,255,157,0.55)" }}>
          ALIXEN
        </span>
      </div>

      {/* ── ALIXEN speech bubble ── */}
      <div className="mb-6">
        <div className="relative rounded-2xl px-5 py-4"
          style={{
            background: "rgba(0,255,157,0.06)",
            border: "1px solid rgba(0,255,157,0.18)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div className="absolute -bottom-2 left-8 w-4 h-4 rotate-45"
            style={{ background: "rgba(0,255,157,0.06)", borderRight: "1px solid rgba(0,255,157,0.18)", borderBottom: "1px solid rgba(0,255,157,0.18)" }} />
          <p className="text-sm text-white/85 font-medium leading-relaxed">
            {locale === "fr"
              ? "Content de te revoir ! Pr\u00eat \u00e0 propulser ton Score de Vitalit\u00e9 ?"
              : "Great to see you again! Ready to boost your Vitality Score?"}
          </p>
        </div>
      </div>

      {/* ── LIXUM header ── */}
      <div className="text-center mb-8">
        <h1 className="font-black tracking-[.22em] leading-none text-2xl" style={{ fontFamily: "'Courier New',monospace" }}>
          <span style={{ color: "#8b949e" }}>LI</span>
          <span style={{ color: "#00ff9d", textShadow: "0 0 12px #00ff9d, 0 0 28px rgba(0,255,157,.50)" }}>X</span>
          <span style={{ color: "#8b949e" }}>UM</span>
        </h1>
        <p className="text-[9px] uppercase font-semibold mt-1 tracking-[.32em]" style={{ color: "rgba(0,255,157,0.45)" }}>
          Gateway
        </p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm text-red-400 font-medium"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)" }}>
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            {locale === "fr" ? "Adresse email" : "Email"}
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Mail size={16} style={{ color: "rgba(0,255,157,0.45)" }} />
            </div>
            <input id="login-email" type="email" required value={email}
              onChange={e => setEmail(e.target.value)} className="lx-glass-input"
              placeholder="ton@email.com" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            {locale === "fr" ? "Mot de passe" : "Password"}
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Lock size={16} style={{ color: "rgba(0,255,157,0.45)" }} />
            </div>
            <input id="login-password" type="password" required minLength={6} value={password}
              onChange={e => setPassword(e.target.value)} className="lx-glass-input"
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="lx-next-btn w-full mt-2">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="lx-data-sync" />
              {locale === "fr" ? "Connexion..." : "Connecting..."}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {locale === "fr" ? "Se connecter" : "Log in"}
              <ChevronRight size={18} />
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 text-white/30 text-xs font-medium" style={{ background: "#050805" }}>
              {locale === "fr" ? "ou" : "or"}
            </span>
          </div>
        </div>

        {/* Google */}
        <button type="button" onClick={handleGoogleLogin}
          className="w-full px-5 py-3.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.65)",
          }}>
          {locale === "fr" ? "Continuer avec Google" : "Continue with Google"}
        </button>
      </form>

      {/* ── Register link ── */}
      <p className="text-center text-sm text-white/35 mt-8">
        {locale === "fr" ? "Pas encore de compte ?" : "No account yet?"}{" "}
        <Link href={`/${locale}/register`} className="text-[#00ff9d] font-semibold hover:underline">
          {locale === "fr" ? "Cr\u00e9er un compte" : "Register"}
        </Link>
      </p>
    </div>
  );
}
