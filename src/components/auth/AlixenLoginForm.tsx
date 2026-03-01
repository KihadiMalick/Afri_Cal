"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { type Locale } from "@/i18n";
import { Mail, Lock, Eye, EyeOff, ChevronRight } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   ALIXEN SVG fallback (same bird as RegisterForm)
═══════════════════════════════════════════════════════════ */
function AlixenSVGFallback() {
  return (
    <svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}>
      <defs>
        <radialGradient id="lBodyGlow" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#00ff9d" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#00ff9d" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="lTailGlow" cx="50%" cy="85%" r="55%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.14"/>
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"/>
        </radialGradient>
        <filter id="lGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="150" cy="380" rx="110" ry="90" fill="url(#lTailGlow)"/>
      <ellipse cx="150" cy="200" rx="85" ry="75" fill="url(#lBodyGlow)"/>
      <path d="M150 375 Q140 420 128 488" stroke="#00ff9d" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75"/>
      <path d="M150 375 Q150 435 150 492" stroke="#00ff9d" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9"/>
      <path d="M150 375 Q160 420 172 488" stroke="#00ff9d" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75"/>
      <path d="M150 385 Q118 425 93 472" stroke="#60a5fa" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
      <path d="M150 385 Q182 425 207 472" stroke="#60a5fa" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
      <path d="M147 398 Q98 428 63 458" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.45"/>
      <path d="M153 398 Q202 428 237 458" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.45"/>
      <circle cx="128" cy="488" r="6" fill="none" stroke="#00ff9d" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="128" cy="488" r="2.5" fill="#00ff9d" opacity="0.85"/>
      <circle cx="150" cy="492" r="7" fill="none" stroke="#00ff9d" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="150" cy="492" r="3" fill="#00ff9d" opacity="1" filter="url(#lGlow)"/>
      <circle cx="172" cy="488" r="6" fill="none" stroke="#00ff9d" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="172" cy="488" r="2.5" fill="#00ff9d" opacity="0.85"/>
      <circle cx="93" cy="472" r="5" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="207" cy="472" r="5" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.5"/>
      <rect x="95" y="370" width="110" height="7" rx="3.5" fill="rgba(0,255,157,0.10)" stroke="rgba(0,255,157,0.22)" strokeWidth="1"/>
      <circle cx="120" cy="373.5" r="2" fill="#00ff9d" opacity="0.55"/>
      <circle cx="150" cy="373.5" r="2" fill="#00ff9d" opacity="0.75"/>
      <circle cx="180" cy="373.5" r="2" fill="#00ff9d" opacity="0.55"/>
      <ellipse cx="150" cy="278" rx="62" ry="92" fill="rgba(255,255,255,0.055)" stroke="rgba(255,255,255,0.11)" strokeWidth="1"/>
      <path d="M90 255 Q67 268 60 290 Q76 278 92 282" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.09)" strokeWidth="1"/>
      <path d="M210 255 Q233 268 240 290 Q224 278 208 282" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.09)" strokeWidth="1"/>
      <path d="M122 288 Q150 308 178 288 L173 330 Q150 343 127 330 Z" fill="rgba(0,255,157,0.04)" stroke="rgba(0,255,157,0.14)" strokeWidth="1"/>
      <text x="150" y="316" textAnchor="middle" fontFamily="'Courier New', monospace" fontWeight="900" fontSize="13" fill="rgba(0,255,157,0.32)" letterSpacing="3">LX</text>
      <ellipse cx="150" cy="192" rx="28" ry="37" fill="rgba(255,255,255,0.065)" stroke="rgba(255,255,255,0.11)" strokeWidth="1"/>
      <circle cx="150" cy="138" r="40" fill="rgba(255,255,255,0.075)" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5"/>
      <path d="M131 98 Q121 62 117 32" stroke="rgba(255,255,255,0.38)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="117" cy="30" r="5" fill="#00ff9d" opacity="0.85" filter="url(#lGlow)"/>
      <path d="M141 93 Q136 57 134 22" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="134" cy="20" r="6" fill="#00ff9d" opacity="1" filter="url(#lGlow)"/>
      <path d="M150 90 Q150 53 150 16" stroke="rgba(255,255,255,0.62)" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="150" cy="14" r="7" fill="#00ff9d" opacity="1" filter="url(#lGlow)"/>
      <path d="M159 93 Q164 57 166 22" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="166" cy="20" r="6" fill="#00ff9d" opacity="1" filter="url(#lGlow)"/>
      <path d="M169 98 Q179 62 183 32" stroke="rgba(255,255,255,0.38)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="183" cy="30" r="5" fill="#00ff9d" opacity="0.85" filter="url(#lGlow)"/>
      <circle cx="136" cy="130" r="8" fill="rgba(0,255,157,0.13)" stroke="rgba(0,255,157,0.38)" strokeWidth="1.5"/>
      <circle cx="136" cy="130" r="3.5" fill="#00ff9d" opacity="0.78"/>
      <circle cx="164" cy="130" r="8" fill="rgba(0,255,157,0.13)" stroke="rgba(0,255,157,0.38)" strokeWidth="1.5"/>
      <circle cx="164" cy="130" r="3.5" fill="#00ff9d" opacity="0.78"/>
      <path d="M140 148 Q150 156 160 148 Q156 163 150 168 Q144 163 140 148 Z" fill="rgba(245,158,11,0.38)" stroke="rgba(245,158,11,0.58)" strokeWidth="1"/>
      <circle cx="72" cy="195" r="2" fill="#00ff9d" opacity="0.28"/>
      <circle cx="58" cy="248" r="1.5" fill="#60a5fa" opacity="0.28"/>
      <circle cx="228" cy="178" r="2" fill="#00ff9d" opacity="0.28"/>
      <circle cx="242" cy="232" r="1.5" fill="#60a5fa" opacity="0.28"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   ALIXEN Login — LIXUM premium dark style
═══════════════════════════════════════════════════════════ */
export default function AlixenLoginForm({ locale }: { locale: Locale }) {
  const router   = useRouter();
  const supabase = createClient();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [imgError, setImgError] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) { setError(authErr.message); setLoading(false); return; }

    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  async function handleGoogle() {
    setError("");
    const { error: authErr } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/${locale}/callback` },
    });
    if (authErr) setError(authErr.message);
  }

  return (
    <div className="lx-auth-root">

      {/* ── Form panel (LEFT) ── */}
      <div className="lx-form-panel">

        {/* Mobile ALIXEN avatar — hidden on desktop by CSS */}
        <div className="lx-alixen-mobile">
          <div style={{
            width: 48, height: 48, borderRadius: "50%", overflow: "hidden",
            position: "relative", flexShrink: 0,
            background: "rgba(0,255,157,0.05)",
            border: "1.5px solid rgba(0,255,157,0.22)",
            boxShadow: "0 0 14px rgba(0,255,157,0.12)",
          }}>
            <svg viewBox="110 5 80 175" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
              <circle cx="150" cy="138" r="40" fill="rgba(255,255,255,0.075)" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5"/>
              <path d="M131 98 Q121 62 117 32" stroke="rgba(255,255,255,0.38)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <circle cx="117" cy="30" r="5" fill="#00ff9d" opacity="0.9"/>
              <path d="M141 93 Q136 57 134 22" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <circle cx="134" cy="20" r="6" fill="#00ff9d"/>
              <path d="M150 90 Q150 53 150 16" stroke="rgba(255,255,255,0.62)" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <circle cx="150" cy="14" r="7" fill="#00ff9d"/>
              <path d="M159 93 Q164 57 166 22" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <circle cx="166" cy="20" r="6" fill="#00ff9d"/>
              <path d="M169 98 Q179 62 183 32" stroke="rgba(255,255,255,0.38)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <circle cx="183" cy="30" r="5" fill="#00ff9d" opacity="0.9"/>
              <circle cx="136" cy="130" r="7" fill="rgba(0,255,157,0.13)" stroke="rgba(0,255,157,0.38)" strokeWidth="1.5"/>
              <circle cx="136" cy="130" r="3" fill="#00ff9d" opacity="0.8"/>
              <circle cx="164" cy="130" r="7" fill="rgba(0,255,157,0.13)" stroke="rgba(0,255,157,0.38)" strokeWidth="1.5"/>
              <circle cx="164" cy="130" r="3" fill="#00ff9d" opacity="0.8"/>
              <path d="M140 148 Q150 155 160 148 Q156 162 150 167 Q144 162 140 148 Z" fill="rgba(245,158,11,0.4)" stroke="rgba(245,158,11,0.6)" strokeWidth="1"/>
            </svg>
          </div>
          <div>
            <p className="lx-alixen-mobile-text">ALIXEN</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginTop: 2 }}>Guide Bio-Digital</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* LIXUM brand */}
          <div className="mb-8">
            <h1 className="lx-brand-title">
              <span style={{ color: "#6b7280" }}>LI</span>
              <span className="lx-x">X</span>
              <span style={{ color: "#6b7280" }}>UM</span>
            </h1>
            <p className="lx-brand-sub">Gateway · Connexion</p>
          </div>

          {/* ALIXEN bubble — arrow points RIGHT toward ALIXEN panel */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.35 }}
            className="mb-7 relative"
          >
            <div
              className="rounded-2xl px-5 py-4"
              style={{
                background: "rgba(0,255,157,0.05)",
                border: "1px solid rgba(0,255,157,0.16)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
              }}
            >
              <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                {locale === "fr"
                  ? "Content de te revoir ! Prêt à propulser ton Score de Vitalité ?"
                  : "Great to see you again! Ready to boost your Vitality Score?"}
              </p>
            </div>
            {/* Arrow pointing RIGHT — only visible on desktop */}
            <div className="lx-bubble-arrow" aria-hidden="true" />
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.40)" }}>
                {locale === "fr" ? "Adresse email" : "Email"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail size={15} style={{ color: "rgba(0,255,157,0.45)" }} />
                </span>
                <input id="login-email" type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="lx-input" placeholder="ton@email.com" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-pass" className="block text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.40)" }}>
                {locale === "fr" ? "Mot de passe" : "Password"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock size={15} style={{ color: "rgba(0,255,157,0.45)" }} />
                </span>
                <input id="login-pass" type={showPass ? "text" : "password"} required minLength={6}
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="lx-input" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "rgba(255,255,255,0.30)" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171" }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              className="lx-btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="lx-spinner" />
                  {locale === "fr" ? "Connexion..." : "Connecting..."}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {locale === "fr" ? "Se connecter" : "Log in"}
                  <ChevronRight size={16} />
                </span>
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-[11px] font-medium" style={{ background: "#0a0a0a", color: "rgba(255,255,255,0.25)" }}>
                  {locale === "fr" ? "ou continuer avec" : "or continue with"}
                </span>
              </div>
            </div>

            {/* Google */}
            <motion.button
              type="button"
              onClick={handleGoogle}
              whileTap={{ scale: 0.97 }}
              className="w-full px-5 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.55)",
                cursor: "pointer",
              }}
            >
              {/* Google G */}
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {locale === "fr" ? "Continuer avec Google" : "Continue with Google"}
            </motion.button>
          </form>

          <p className="text-center text-xs mt-7" style={{ color: "rgba(255,255,255,0.30)" }}>
            {locale === "fr" ? "Pas encore de compte ?" : "No account yet?"}{" "}
            <Link href={`/${locale}/register`}
              className="font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "#00ff9d" }}>
              {locale === "fr" ? "Créer un compte" : "Register"}
            </Link>
          </p>
        </motion.div>
      </div>

      {/* ── ALIXEN panel (RIGHT) — desktop only ── */}
      <div className="lx-alixen-panel" aria-hidden="true">
        <div className="lx-alixen-glow" />
        <div className="relative w-full h-full flex items-end justify-center pb-8">
          {imgError ? (
            <div style={{ width: "85%", maxWidth: 340, paddingBottom: "2rem" }}>
              <AlixenSVGFallback />
            </div>
          ) : (
            <Image
              src="/ALIXEN (1).png"
              alt="ALIXEN"
              fill
              style={{ objectFit: "contain", objectPosition: "bottom center" }}
              priority
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <p className="lx-alixen-label">ALIXEN</p>
      </div>
    </div>
  );
}
