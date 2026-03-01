"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { type Locale } from "@/i18n";
import { getCalorieCalculation } from "@/utils/calories";
import {
  User, Mail, Lock, Eye, EyeOff, Ruler,
  TrendingDown, TrendingUp, Minus,
  ChevronRight, ChevronLeft, Zap, Shield, Fuel, Dumbbell,
  Target, Calendar, CheckCircle2, Weight,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
type Gender = "male" | "female";
type Goal = "lose" | "maintain" | "gain";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

/* ─────────────────────────────────────────────────────────
   Framer Motion card variants
───────────────────────────────────────────────────────── */
const cardVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.96,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      x:       { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.28, ease: "easeOut" },
      scale:   { duration: 0.28, ease: "easeOut" },
      filter:  { duration: 0.22, ease: "easeOut" },
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.96,
    filter: "blur(4px)",
    transition: {
      x:       { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.22, ease: "easeIn" },
      scale:   { duration: 0.22 },
      filter:  { duration: 0.18 },
    },
  }),
};

/* ─────────────────────────────────────────────────────────
   Progress dots
───────────────────────────────────────────────────────── */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width:      i === current ? 32 : 8,
            background: i <= current
              ? i === current ? "#00ff9d" : "rgba(0,255,157,0.35)"
              : "rgba(255,255,255,0.10)",
            boxShadow:  i === current ? "0 0 12px rgba(0,255,157,0.55)" : "none",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{ height: 6, borderRadius: 99 }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ALIXEN speech bubble
───────────────────────────────────────────────────────── */
function AlixenBubble({ text, sub }: { text: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="mb-6 rounded-2xl px-5 py-4 relative"
      style={{
        background: "rgba(0,255,157,0.05)",
        border: "1px solid rgba(0,255,157,0.16)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
      }}
    >
      <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
        {text}
      </p>
      {sub && (
        <p className="text-xs mt-2 leading-relaxed italic" style={{ color: "rgba(255,255,255,0.45)" }}>
          {sub}
        </p>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Glass input
───────────────────────────────────────────────────────── */
function GlassInput({
  icon: Icon, label, id, rightSlot, ...props
}: {
  icon: React.ElementType;
  label: string;
  id: string;
  rightSlot?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: "rgba(255,255,255,0.40)" }}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon size={15} style={{ color: "rgba(0,255,157,0.45)" }} />
        </span>
        <input id={id} className="lx-input" {...props} />
        {rightSlot && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Selection pill
───────────────────────────────────────────────────────── */
function Pill({
  selected, onClick, icon: Icon, color = "#00ff9d", children,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: React.ElementType;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      animate={{
        borderColor: selected ? color : "rgba(255,255,255,0.08)",
        background:  selected ? `${color}14` : "rgba(255,255,255,0.02)",
        boxShadow:   selected ? `0 0 18px ${color}18` : "none",
      }}
      transition={{ duration: 0.2 }}
      className="w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 font-medium"
      style={{ border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}
    >
      {Icon && <Icon size={17} style={{ color: selected ? color : "rgba(255,255,255,0.30)", flexShrink: 0 }} />}
      <span className="text-sm" style={{ color: selected ? color : "rgba(255,255,255,0.60)" }}>
        {children}
      </span>
      {selected && (
        <CheckCircle2 size={15} className="ml-auto flex-shrink-0" style={{ color }} />
      )}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────
   Metric reveal card
───────────────────────────────────────────────────────── */
function MetricCard({ label, value, unit, color }: {
  label: string; value: number; unit: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl px-5 py-4"
      style={{
        background: `${color}0a`,
        border: `1px solid ${color}22`,
      }}
    >
      <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5"
        style={{ color: "rgba(255,255,255,0.40)" }}>
        {label}
      </p>
      <p className="text-3xl font-black tabular-nums" style={{ color }}>
        {value}
        <span className="text-xs font-normal ml-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>{unit}</span>
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Macro card
───────────────────────────────────────────────────────── */
function MacroCard({ icon: Icon, label, value, desc, color }: {
  icon: React.ElementType; label: string; value: number; desc: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl p-4 flex items-start gap-4"
      style={{ background: `${color}0a`, border: `1px solid ${color}22` }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <p className="text-[10px] uppercase tracking-wider font-semibold"
            style={{ color: "rgba(255,255,255,0.40)" }}>{label}</p>
          <p className="text-lg font-black tabular-nums" style={{ color }}>
            {value}g<span className="text-xs font-normal ml-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>/j</span>
          </p>
        </div>
        <p className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.40)" }}>{desc}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Next / Back buttons
───────────────────────────────────────────────────────── */
function NavButtons({
  onNext, onBack, nextLabel = "Suivant", loading = false, isLast = false,
  locale,
}: {
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  loading?: boolean;
  isLast?: boolean;
  locale: Locale;
}) {
  return (
    <div className="flex items-center gap-3 mt-8">
      {onBack && (
        <motion.button
          type="button"
          onClick={onBack}
          whileTap={{ scale: 0.96 }}
          className="px-5 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.45)",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={16} />
          {locale === "fr" ? "Retour" : "Back"}
        </motion.button>
      )}
      <motion.button
        type="button"
        onClick={onNext}
        disabled={loading}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className="lx-btn-primary flex-1"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="lx-spinner" />
            {locale === "fr" ? "Synchronisation..." : "Syncing..."}
          </span>
        ) : isLast ? (
          <span className="flex items-center justify-center gap-2">
            {nextLabel}
            <Zap size={16} />
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {nextLabel}
            <ChevronRight size={16} />
          </span>
        )}
      </motion.button>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   MAIN — AlixenRegisterForm
═════════════════════════════════════════════════════════ */
export default function AlixenRegisterForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep]         = useState(0);
  const [dir, setDir]           = useState(1);
  const [syncing, setSyncing]   = useState(false);
  const [error, setError]       = useState("");

  /* Step 1 */
  const [fullName, setFullName]         = useState("");
  const [email, setEmail]               = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword]         = useState("");
  const [passConfirm, setPassConfirm]   = useState("");
  const [showPass, setShowPass]         = useState(false);
  const [showPassC, setShowPassC]       = useState(false);

  /* Step 2 */
  const [gender, setGender]   = useState<Gender | null>(null);
  const [height, setHeight]   = useState("");
  const [weight, setWeight]   = useState("");
  const [age, setAge]         = useState("");

  /* Step 3 */
  const [goal, setGoal]               = useState<Goal | null>(null);
  const [targetKg, setTargetKg]       = useState("");
  const [targetMonths, setTargetMonths] = useState<1 | 2 | 3>(3);
  const [activity, setActivity]       = useState<ActivityLevel | null>(null);

  const TOTAL = 5;

  /* Computed cals */
  const computed = (() => {
    const w  = parseFloat(weight) || 70;
    const h  = parseFloat(height) || 170;
    const a  = parseInt(age)       || 25;
    const g  = gender              || "male";
    const al = activity            || "moderate";
    const gl = goal                || "maintain";
    const tk = parseFloat(targetKg) || 0;
    return getCalorieCalculation(w, h, a, g, al, gl, tk, targetMonths);
  })();

  const macros = {
    protein: Math.round((computed.dailyTarget * 0.30) / 4),
    carbs:   Math.round((computed.dailyTarget * 0.45) / 4),
    fat:     Math.round((computed.dailyTarget * 0.25) / 9),
  };

  /* ALIXEN compliment based on metrics */
  const alixenCompliment = useCallback(() => {
    const h = parseFloat(height);
    const a = parseInt(age);
    if (h >= 180) return "Quelle stature impressionnante ! Ta carrure va dominer ton Score de Vitalité.";
    if (a > 0 && a < 25) return "La jeunesse est ton super-pouvoir ! On va booster tes données pour un futur légendaire.";
    return "Chaque corps est unique, et le tien est parfait pour commencer cette aventure.";
  }, [height, age]);

  /* navigate */
  function advance() {
    setError("");
    if (step === 0) {
      if (!fullName.trim())               return setError("Indique ton nom d'utilisateur.");
      if (!email.trim())                  return setError("Ton adresse email est obligatoire.");
      if (email !== emailConfirm)         return setError("Les deux adresses email ne correspondent pas.");
      if (password.length < 6)           return setError("Le mot de passe doit contenir au moins 6 caractères.");
      if (password !== passConfirm)       return setError("Les deux mots de passe ne correspondent pas.");
    }
    if (step === 1) {
      if (!gender || !height.trim() || !weight.trim() || !age.trim())
        return setError("Remplis toutes tes métriques.");
    }
    if (step === 2) {
      if (!goal)     return setError("Choisis un objectif.");
      if (!activity) return setError("Choisis ton niveau d'activité.");
      if (goal !== "maintain" && !targetKg.trim()) return setError("Indique combien de kg tu vises.");
    }
    if (step < TOTAL - 1) { setDir(1); setStep(s => s + 1); }
  }

  function goBack() {
    setError("");
    if (step > 0) { setDir(-1); setStep(s => s - 1); }
  }

  /* final submit */
  async function handleFinish() {
    setSyncing(true);
    setError("");

    const { data, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/${locale}/callback` },
    });
    if (authErr) { setError(authErr.message); setSyncing(false); return; }

    const uid = data.user?.id;
    if (!uid) { setError("Erreur lors de la création du compte."); setSyncing(false); return; }

    const wlNum = goal !== "maintain" ? (parseFloat(targetKg) || 5) : 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbErr } = await (supabase as any).from("users_profile").upsert({
      user_id: uid,
      full_name: fullName,
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      gender,
      goal,
      activity_level: activity,
      target_months: targetMonths,
      target_weight_loss: wlNum,
      daily_calorie_target: computed.dailyTarget,
      bmr: computed.bmr,
      tdee: computed.tdee,
      onboarding_completed: true,
    }, { onConflict: "user_id" });

    if (dbErr) { setError(dbErr.message); setSyncing(false); return; }
    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  /* Scroll top on step change */
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  /* Step titles */
  const stepTitles = locale === "fr"
    ? ["Identité", "Métriques", "Objectifs", "Bilan BMR", "Tes Macros"]
    : ["Identity", "Metrics", "Goals", "BMR Report", "Your Macros"];

  return (
    <div className="lx-auth-root">

      {/* ── ALIXEN fixed right panel (visible on step 0 on large screens) ── */}
      <div
        className="lx-alixen-panel"
        style={{ opacity: step === 0 ? 1 : 0.25, transition: "opacity 0.5s ease" }}
        aria-hidden="true"
      >
        <div className="lx-alixen-glow" />
        <div className="relative w-full h-full flex items-end justify-center pb-8">
          <Image
            src="/ALIXEN (1).png"
            alt="ALIXEN"
            fill
            style={{ objectFit: "contain", objectPosition: "bottom center" }}
            priority
          />
        </div>
        <p className="lx-alixen-label">ALIXEN</p>
      </div>

      {/* ── Form panel ── */}
      <div className="lx-form-panel">
        {/* LIXUM header */}
        <div className="mb-8">
          <h1 className="lx-brand-title">
            <span style={{ color: "#6b7280" }}>LI</span>
            <span className="lx-x">X</span>
            <span style={{ color: "#6b7280" }}>UM</span>
          </h1>
          <p className="lx-brand-sub">Gateway · {stepTitles[step]}</p>
        </div>

        <StepDots current={step} total={TOTAL} />

        {/* Animated card */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >

            {/* ─── STEP 0: Identity ─── */}
            {step === 0 && (
              <div className="space-y-4">
                <AlixenBubble
                  text="Bonjour ! Je suis ALIXEN, ton guide Bio-Digital. Pour commencer, dis-moi ton nom d'utilisateur. C'est comme ça que tu apparaîtras sur ton Dashboard et dans ton Score de Vitalité !"
                />
                <GlassInput icon={User} label="Nom d'utilisateur" id="fullName"
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Ex : KhadijaBa" />
                <GlassInput icon={Mail} label="Adresse email" id="email"
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="ton@email.com" />
                <GlassInput icon={Mail} label="Confirmer l'email" id="emailConfirm"
                  type="email" value={emailConfirm} onChange={e => setEmailConfirm(e.target.value)}
                  placeholder="ton@email.com" />
                <GlassInput icon={Lock} label="Mot de passe" id="password"
                  type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  rightSlot={
                    <button type="button" onClick={() => setShowPass(v => !v)} className="text-white/30 hover:text-white/60 transition-colors">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
                <GlassInput icon={Lock} label="Confirmer le mot de passe" id="passConfirm"
                  type={showPassC ? "text" : "password"} value={passConfirm}
                  onChange={e => setPassConfirm(e.target.value)} placeholder="••••••••"
                  rightSlot={
                    <button type="button" onClick={() => setShowPassC(v => !v)} className="text-white/30 hover:text-white/60 transition-colors">
                      {showPassC ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
              </div>
            )}

            {/* ─── STEP 1: Metrics ─── */}
            {step === 1 && (
              <div className="space-y-4">
                <AlixenBubble
                  text={alixenCompliment()}
                  sub="Ces informations nous aident à calibrer ton moteur d'énergie. C'est comme régler les paramètres d'un jeu vidéo pour qu'il soit parfait pour toi !"
                />
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.40)" }}>
                    {locale === "fr" ? "Sexe" : "Gender"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Pill selected={gender === "male"}   onClick={() => setGender("male")}   color="#60a5fa">Homme</Pill>
                    <Pill selected={gender === "female"} onClick={() => setGender("female")} color="#f9a8d4">Femme</Pill>
                  </div>
                </div>
                <GlassInput icon={Ruler}    label="Taille (cm)" id="height"
                  type="number" min={100} max={250} value={height} onChange={e => setHeight(e.target.value)} placeholder="175" />
                <GlassInput icon={Weight}   label="Poids (kg)"  id="weight"
                  type="number" min={20} max={500} step={0.1} value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" />
                <GlassInput icon={Calendar} label="Âge"         id="age"
                  type="number" min={10} max={120} value={age} onChange={e => setAge(e.target.value)} placeholder="25" />
              </div>
            )}

            {/* ─── STEP 2: Goals ─── */}
            {step === 2 && (
              <div className="space-y-5">
                <AlixenBubble
                  text="On a presque fini ! Choisis ton objectif et clique sur 'Suivant' — je vais t'expliquer ton moteur BMR."
                />
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "rgba(255,255,255,0.40)" }}>
                    {locale === "fr" ? "Objectif" : "Goal"}
                  </p>
                  <Pill selected={goal === "lose"}     onClick={() => setGoal("lose")}     icon={TrendingDown} color="#60a5fa">Perdre du poids</Pill>
                  <Pill selected={goal === "maintain"} onClick={() => setGoal("maintain")} icon={Minus}        color="#00ff9d">Maintenir ma forme</Pill>
                  <Pill selected={goal === "gain"}     onClick={() => setGoal("gain")}     icon={TrendingUp}   color="#f59e0b">Prendre du poids</Pill>
                </div>

                {goal && goal !== "maintain" && (
                  <div className="space-y-3">
                    <GlassInput icon={Target} label={goal === "lose" ? "Kg à perdre" : "Kg à prendre"} id="targetKg"
                      type="number" min={1} max={50} step={0.5} value={targetKg}
                      onChange={e => setTargetKg(e.target.value)} placeholder="5" />
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: "rgba(255,255,255,0.40)" }}>Sur quelle période ?</p>
                      <div className="grid grid-cols-3 gap-2">
                        {([1, 2, 3] as const).map(m => (
                          <Pill key={m} selected={targetMonths === m} onClick={() => setTargetMonths(m)}>
                            {m} {locale === "fr" ? "mois" : "mo."}
                          </Pill>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "rgba(255,255,255,0.40)" }}>
                    {locale === "fr" ? "Niveau d'activité" : "Activity Level"}
                  </p>
                  {([
                    { k: "sedentary" as const, fr: "Sédentaire",         en: "Sedentary" },
                    { k: "light"     as const, fr: "Légèrement actif",   en: "Lightly active" },
                    { k: "moderate"  as const, fr: "Modérément actif",   en: "Moderately active" },
                    { k: "active"    as const, fr: "Très actif",         en: "Very active" },
                  ]).map(a => (
                    <Pill key={a.k} selected={activity === a.k} onClick={() => setActivity(a.k)} icon={Dumbbell}>
                      {locale === "fr" ? a.fr : a.en}
                    </Pill>
                  ))}
                </div>
              </div>
            )}

            {/* ─── STEP 3: BMR Reveal ─── */}
            {step === 3 && (
              <div className="space-y-4">
                <AlixenBubble
                  text="Voici ton moteur d'énergie ! Clique sur 'Suivant' et je t'explique tes briques de données."
                  sub="Ton BMR (Métabolisme de Base), c'est l'énergie dont ton corps a besoin juste pour respirer et faire battre ton cœur, même quand tu dors ! C'est ton carburant minimal."
                />
                <MetricCard label="Métabolisme de Base (BMR)"    value={computed.bmr}         unit="kcal/j" color="#00ff9d" />
                <MetricCard label="Dépense Totale (TDEE)"        value={computed.tdee}        unit="kcal/j" color="#60a5fa" />
                <MetricCard label="Objectif Calorique Quotidien" value={computed.dailyTarget} unit="kcal/j" color="#f59e0b" />
              </div>
            )}

            {/* ─── STEP 4: Macros ─── */}
            {step === 4 && (
              <div className="space-y-4">
                <AlixenBubble
                  text="Félicitations ! Ton 'Parcours Vitalité' est activé. Voici tes briques de données :"
                />
                <MacroCard icon={Shield} label="Protéines" value={macros.protein} color="#ef4444"
                  desc="Les briques de ton corps. Elles construisent tes muscles." />
                <MacroCard icon={Fuel}   label="Glucides"  value={macros.carbs}   color="#f59e0b"
                  desc="Le super-carburant, comme de l'essence pour une voiture. Ils te donnent la force de bouger." />
                <MacroCard icon={Zap}    label="Lipides"   value={macros.fat}     color="#60a5fa"
                  desc="L'armure de tes cellules. Ils sont importants pour te protéger." />
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171" }}
          >
            {error}
          </motion.div>
        )}

        {/* Navigation */}
        <NavButtons
          onNext={step < TOTAL - 1 ? advance : handleFinish}
          onBack={step > 0 ? goBack : undefined}
          nextLabel={
            step < TOTAL - 1
              ? (locale === "fr" ? "Suivant" : "Next")
              : (locale === "fr" ? "Activer mon Parcours" : "Activate my Journey")
          }
          loading={syncing}
          isLast={step === TOTAL - 1}
          locale={locale}
        />

        {/* Login link */}
        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.30)" }}>
          {locale === "fr" ? "Déjà un compte ?" : "Already have an account?"}{" "}
          <Link href={`/${locale}/login`}
            className="font-semibold transition-colors hover:opacity-80"
            style={{ color: "#00ff9d" }}>
            {locale === "fr" ? "Se connecter" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
