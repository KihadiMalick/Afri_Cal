"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { type Locale } from "@/i18n";
import { getCalorieCalculation } from "@/utils/calories";
import {
  User, Mail, Lock, Ruler, Weight, Calendar,
  Target, TrendingDown, TrendingUp, Minus,
  ChevronRight, Zap, Shield, Fuel, Dumbbell,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   ALIXEN REGISTER — Parcours guidé en 5 étapes
   ═══════════════════════════════════════════════════════════ */

type Gender = "male" | "female";
type Goal = "lose" | "maintain" | "gain";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

/* ── ALIXEN speech bubble ── */
function AlixenBubble({ text, subText }: { text: string; subText?: string }) {
  return (
    <div className="alixen-bubble mb-6">
      <div
        className="relative rounded-2xl px-5 py-4"
        style={{
          background: "rgba(0,255,157,0.06)",
          border: "1px solid rgba(0,255,157,0.18)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Speech arrow */}
        <div
          className="absolute -bottom-2 left-8 w-4 h-4 rotate-45"
          style={{
            background: "rgba(0,255,157,0.06)",
            borderRight: "1px solid rgba(0,255,157,0.18)",
            borderBottom: "1px solid rgba(0,255,157,0.18)",
          }}
        />
        <p className="text-sm text-white/85 font-medium leading-relaxed">{text}</p>
        {subText && (
          <p className="text-xs text-white/50 mt-2 leading-relaxed italic">{subText}</p>
        )}
      </div>
    </div>
  );
}

/* ── ALIXEN character (SVG bird placeholder) ── */
function AlixenAvatar() {
  return (
    <div className="flex flex-col items-center mb-4">
      {/* Data platform glow */}
      <div
        className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-2"
        style={{
          background: "linear-gradient(135deg, rgba(0,255,157,0.12) 0%, rgba(0,180,120,0.06) 100%)",
          border: "1px solid rgba(0,255,157,0.25)",
          boxShadow: "0 0 30px rgba(0,255,157,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* ALIXEN bird — stylized LX monogram with wings */}
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          {/* Body */}
          <ellipse cx="22" cy="24" rx="10" ry="12" fill="rgba(255,255,255,0.90)" />
          {/* Head */}
          <circle cx="22" cy="13" r="7" fill="rgba(255,255,255,0.95)" />
          {/* Eye */}
          <circle cx="24" cy="12" r="1.5" fill="#020c07" />
          <circle cx="24.5" cy="11.5" r="0.5" fill="#00ff9d" />
          {/* Beak */}
          <path d="M27 14 L31 13.5 L27 15 Z" fill="#f59e0b" />
          {/* Crest/Huppe */}
          <path d="M18 8 Q20 3 22 6 Q24 3 26 8" stroke="#00ff9d" strokeWidth="1.2" fill="none" />
          <path d="M19 7 Q21 2 23 7" stroke="#00ff9d" strokeWidth="0.8" fill="none" opacity="0.6" />
          {/* Tail feathers (peacock fan) */}
          <path d="M22 36 Q12 32 8 26" stroke="rgba(0,255,157,0.6)" strokeWidth="1" fill="none" />
          <path d="M22 36 Q14 34 10 30" stroke="rgba(0,255,157,0.4)" strokeWidth="1" fill="none" />
          <path d="M22 36 Q30 34 34 30" stroke="rgba(0,255,157,0.4)" strokeWidth="1" fill="none" />
          <path d="M22 36 Q32 32 36 26" stroke="rgba(0,255,157,0.6)" strokeWidth="1" fill="none" />
          {/* Tail dots */}
          <circle cx="9" cy="26" r="2" fill="rgba(0,255,157,0.3)" stroke="rgba(0,255,157,0.5)" strokeWidth="0.5" />
          <circle cx="35" cy="26" r="2" fill="rgba(0,255,157,0.3)" stroke="rgba(0,255,157,0.5)" strokeWidth="0.5" />
          <circle cx="11" cy="30" r="1.5" fill="rgba(96,165,250,0.3)" stroke="rgba(96,165,250,0.5)" strokeWidth="0.5" />
          <circle cx="33" cy="30" r="1.5" fill="rgba(96,165,250,0.3)" stroke="rgba(96,165,250,0.5)" strokeWidth="0.5" />
          {/* LX vest */}
          <rect x="17" y="20" rx="2" ry="2" width="10" height="8" fill="rgba(100,100,110,0.7)" />
          <text x="19" y="27" fill="#00ff9d" fontSize="5" fontWeight="900" fontFamily="monospace">LX</text>
        </svg>
        {/* Platform glow ring */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-2 rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(0,255,157,0.25), transparent)",
            filter: "blur(2px)",
          }}
        />
      </div>
      <span
        className="text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ color: "rgba(0,255,157,0.55)" }}
      >
        ALIXEN
      </span>
    </div>
  );
}

/* ── Glass input ── */
function GlassInput({
  icon: Icon, label, id, ...props
}: {
  icon: React.ElementType;
  label: string;
  id: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon size={16} style={{ color: "rgba(0,255,157,0.45)" }} />
        </div>
        <input
          id={id}
          className="lx-glass-input"
          {...props}
        />
      </div>
    </div>
  );
}

/* ── Selection chip ── */
function SelectChip({
  selected, onClick, children, icon: Icon, color = "#00ff9d",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ElementType;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 rounded-xl font-medium transition-all duration-300"
      style={{
        background: selected
          ? `rgba(${color === "#00ff9d" ? "0,255,157" : color === "#60a5fa" ? "96,165,250" : color === "#f59e0b" ? "245,158,11" : "239,68,68"},0.10)`
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${selected
          ? `rgba(${color === "#00ff9d" ? "0,255,157" : color === "#60a5fa" ? "96,165,250" : color === "#f59e0b" ? "245,158,11" : "239,68,68"},0.40)`
          : "rgba(255,255,255,0.08)"}`,
        boxShadow: selected ? `0 0 20px rgba(${color === "#00ff9d" ? "0,255,157" : color === "#60a5fa" ? "96,165,250" : color === "#f59e0b" ? "245,158,11" : "239,68,68"},0.08)` : "none",
        transform: selected ? "scale(1.01)" : "scale(1)",
      }}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon size={18} style={{ color: selected ? color : "rgba(255,255,255,0.35)" }} />}
        <span style={{ color: selected ? color : "rgba(255,255,255,0.65)" }}>{children}</span>
      </div>
    </button>
  );
}

/* ── Progress dots ── */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-500"
          style={{
            width: i === current ? "2rem" : "0.5rem",
            height: "0.5rem",
            background: i <= current
              ? i === current ? "#00ff9d" : "rgba(0,255,157,0.40)"
              : "rgba(255,255,255,0.10)",
            boxShadow: i === current ? "0 0 10px rgba(0,255,157,0.5)" : "none",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function AlixenRegisterForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");

  // Step 1: Identity
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Metrics
  const [gender, setGender] = useState<Gender | null>(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");

  // Step 3: Goal + target
  const [goal, setGoal] = useState<Goal | null>(null);
  const [targetKg, setTargetKg] = useState("");
  const [targetMonths, setTargetMonths] = useState<1 | 2 | 3>(3);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);

  // Step 4: BMR reveal (read-only computed)
  // Step 5: Macros reveal (read-only computed)

  const TOTAL_STEPS = 5;

  /* ── ALIXEN compliment logic ── */
  const getMetricsCompliment = useCallback(() => {
    const h = parseFloat(height);
    const a = parseInt(age);
    if (h >= 180) return "Quelle stature impressionnante ! Ta carrure attire l'attention et va dominer ton Score de Vitalit\u00e9.";
    if (a > 0 && a < 25) return "La jeunesse est ton super-pouvoir ! On va booster tes donn\u00e9es pour un futur l\u00e9gendaire.";
    return "Chaque corps est unique, et le tien est parfait pour commencer cette aventure.";
  }, [height, age]);

  /* ── Calorie computation ── */
  const computed = (() => {
    const w = parseFloat(weight) || 70;
    const h = parseFloat(height) || 170;
    const a = parseInt(age) || 25;
    const g = gender || "male";
    const al = activityLevel || "moderate";
    const gl = goal || "maintain";
    const tk = parseFloat(targetKg) || 0;
    const tm = targetMonths;
    return getCalorieCalculation(w, h, a, g, al, gl, tk, tm);
  })();

  /* ── Macro split (simple: 30% prot, 45% carbs, 25% fat) ── */
  const macros = {
    protein: Math.round((computed.dailyTarget * 0.30) / 4),
    carbs: Math.round((computed.dailyTarget * 0.45) / 4),
    fat: Math.round((computed.dailyTarget * 0.25) / 9),
  };

  /* ── Navigation ── */
  function goNext() {
    setSlideDir("next");
    setError("");

    if (step === 0) {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setError(locale === "fr" ? "Remplis tous les champs pour continuer." : "Fill in all fields to continue.");
        return;
      }
      if (password.length < 6) {
        setError(locale === "fr" ? "Le mot de passe doit contenir au moins 6 caract\u00e8res." : "Password must be at least 6 characters.");
        return;
      }
    }
    if (step === 1) {
      if (!gender || !height.trim() || !weight.trim() || !age.trim()) {
        setError(locale === "fr" ? "Remplis toutes tes m\u00e9triques." : "Fill in all your metrics.");
        return;
      }
    }
    if (step === 2) {
      if (!goal || !activityLevel) {
        setError(locale === "fr" ? "Choisis un objectif et ton niveau d'activit\u00e9." : "Pick a goal and activity level.");
        return;
      }
      if (goal !== "maintain" && !targetKg.trim()) {
        setError(locale === "fr" ? "Indique combien de kg tu vises." : "Enter your target kg.");
        return;
      }
    }

    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  }

  function goBack() {
    setSlideDir("prev");
    setError("");
    if (step > 0) setStep(step - 1);
  }

  /* ── Final submit ── */
  async function handleFinish() {
    setSyncing(true);
    setError("");

    // 1. Create account
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setSyncing(false);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setError(locale === "fr" ? "Erreur lors de la cr\u00e9ation du compte." : "Account creation error.");
      setSyncing(false);
      return;
    }

    // 2. Save profile
    const weightLossNum = goal === "lose" ? (parseFloat(targetKg) || 5) : goal === "gain" ? (parseFloat(targetKg) || 5) : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from("users_profile")
      .upsert(
        {
          user_id: userId,
          full_name: fullName,
          age: parseInt(age),
          weight: parseFloat(weight),
          height: parseFloat(height),
          gender,
          goal,
          activity_level: activityLevel,
          target_months: targetMonths,
          target_weight_loss: weightLossNum,
          daily_calorie_target: computed.dailyTarget,
          bmr: computed.bmr,
          tdee: computed.tdee,
          onboarding_completed: true,
        },
        { onConflict: "user_id" }
      );

    if (dbError) {
      setError(dbError.message);
      setSyncing(false);
      return;
    }

    // 3. Navigate to dashboard
    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  /* ── Slide animation class ── */
  const slideClass = slideDir === "next" ? "alixen-slide-in-right" : "alixen-slide-in-left";

  /* Auto-scroll to top on step change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 min-h-screen flex flex-col justify-center">

      <StepDots current={step} total={TOTAL_STEPS} />

      {/* ═══ STEP 0: Identity ═══ */}
      {step === 0 && (
        <div key="step-0" className={slideClass}>
          <AlixenAvatar />
          <AlixenBubble
            text="Bonjour ! Je suis ALIXEN, ton guide Bio-Digital. Pour commencer, dis-moi ton Nom d'utilisateur. C'est comme \u00e7a que tu appara\u00eetras sur ton Dashboard et dans ton Score de Vitalit\u00e9 !"
          />
          <div className="space-y-4">
            <GlassInput icon={User} label={locale === "fr" ? "Nom d'utilisateur" : "Username"} id="fullName"
              type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Ex: KhadijaBa" />
            <GlassInput icon={Mail} label={locale === "fr" ? "Adresse email" : "Email"} id="email"
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.com" />
            <GlassInput icon={Lock} label={locale === "fr" ? "Mot de passe" : "Password"} id="password"
              type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
          </div>
        </div>
      )}

      {/* ═══ STEP 1: Metrics ═══ */}
      {step === 1 && (
        <div key="step-1" className={slideClass}>
          <AlixenAvatar />
          <AlixenBubble
            text={getMetricsCompliment()}
            subText="Ces informations nous aident \u00e0 calibrer ton moteur d'\u00e9nergie. C'est comme r\u00e9gler les param\u00e8tres d'un jeu vid\u00e9o pour qu'il soit parfait pour toi !"
          />
          <div className="space-y-4">
            {/* Gender */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                {locale === "fr" ? "Sexe" : "Gender"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <SelectChip selected={gender === "male"} onClick={() => setGender("male")}>
                  {locale === "fr" ? "Homme" : "Male"}
                </SelectChip>
                <SelectChip selected={gender === "female"} onClick={() => setGender("female")}>
                  {locale === "fr" ? "Femme" : "Female"}
                </SelectChip>
              </div>
            </div>
            <GlassInput icon={Ruler} label={locale === "fr" ? "Taille (cm)" : "Height (cm)"} id="height"
              type="number" required min={100} max={250} value={height} onChange={e => setHeight(e.target.value)}
              placeholder="175" />
            <GlassInput icon={Weight} label={locale === "fr" ? "Poids (kg)" : "Weight (kg)"} id="weight"
              type="number" required min={20} max={500} step={0.1} value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="70" />
            <GlassInput icon={Calendar} label={locale === "fr" ? "\u00c2ge" : "Age"} id="age"
              type="number" required min={10} max={120} value={age} onChange={e => setAge(e.target.value)}
              placeholder="25" />
          </div>
        </div>
      )}

      {/* ═══ STEP 2: Goal + Activity ═══ */}
      {step === 2 && (
        <div key="step-2" className={slideClass}>
          <AlixenAvatar />
          <AlixenBubble
            text="On a presque fini ! Choisis ton objectif et je vais calibrer ton moteur BMR."
            subText="L'objectif d\u00e9termine si ton corps doit consommer plus ou moins d'\u00e9nergie chaque jour."
          />
          <div className="space-y-5">
            {/* Goal selection */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                {locale === "fr" ? "Objectif" : "Goal"}
              </p>
              <div className="space-y-2">
                <SelectChip selected={goal === "lose"} onClick={() => setGoal("lose")} icon={TrendingDown} color="#60a5fa">
                  {locale === "fr" ? "Perdre du poids" : "Lose weight"}
                </SelectChip>
                <SelectChip selected={goal === "maintain"} onClick={() => setGoal("maintain")} icon={Minus} color="#00ff9d">
                  {locale === "fr" ? "Maintenir en forme" : "Maintain weight"}
                </SelectChip>
                <SelectChip selected={goal === "gain"} onClick={() => setGoal("gain")} icon={TrendingUp} color="#f59e0b">
                  {locale === "fr" ? "Prendre du poids" : "Gain weight"}
                </SelectChip>
              </div>
            </div>

            {/* Target kg + period (for lose/gain) */}
            {goal && goal !== "maintain" && (
              <div className="space-y-4">
                <GlassInput
                  icon={Target}
                  label={locale === "fr"
                    ? `Combien de kg ${goal === "lose" ? "\u00e0 perdre" : "\u00e0 prendre"} ?`
                    : `How many kg to ${goal === "lose" ? "lose" : "gain"}?`}
                  id="targetKg"
                  type="number" min={1} max={50} step={0.5}
                  value={targetKg} onChange={e => setTargetKg(e.target.value)}
                  placeholder="5"
                />
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    {locale === "fr" ? "Sur quelle p\u00e9riode ?" : "Over what period?"}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {([1, 2, 3] as const).map(m => (
                      <SelectChip key={m} selected={targetMonths === m} onClick={() => setTargetMonths(m)}>
                        {m} {locale === "fr" ? "mois" : "mo."}
                      </SelectChip>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activity level */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                {locale === "fr" ? "Niveau d'activit\u00e9" : "Activity level"}
              </p>
              <div className="space-y-2">
                {([
                  { key: "sedentary" as const, fr: "S\u00e9dentaire", en: "Sedentary" },
                  { key: "light" as const, fr: "L\u00e9g\u00e8rement actif", en: "Lightly active" },
                  { key: "moderate" as const, fr: "Mod\u00e9r\u00e9ment actif", en: "Moderately active" },
                  { key: "active" as const, fr: "Tr\u00e8s actif", en: "Very active" },
                ]).map(a => (
                  <SelectChip key={a.key} selected={activityLevel === a.key} onClick={() => setActivityLevel(a.key)} icon={Dumbbell}>
                    {locale === "fr" ? a.fr : a.en}
                  </SelectChip>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: BMR Reveal ═══ */}
      {step === 3 && (
        <div key="step-3" className={slideClass}>
          <AlixenAvatar />
          <AlixenBubble
            text="Tu cliques sur 'Suivant' et je vais t'expliquer tes briques de donn\u00e9es !"
            subText="Ton BMR (M\u00e9tabolisme de Base), c'est l'\u00e9nergie dont ton corps a besoin juste pour respirer et faire battre ton c\u0153ur, m\u00eame quand tu dors ! C'est ton carburant minimal."
          />
          <div className="space-y-4">
            {/* BMR card */}
            <div className="rounded-2xl p-5" style={{
              background: "linear-gradient(135deg, rgba(0,255,157,0.06), rgba(2,12,7,0.80))",
              border: "1px solid rgba(0,255,157,0.20)",
            }}>
              <p className="text-xs text-white/45 uppercase tracking-wider font-semibold mb-2">
                {locale === "fr" ? "M\u00e9tabolisme de Base (BMR)" : "Basal Metabolic Rate (BMR)"}
              </p>
              <p className="text-4xl font-black tabular-nums" style={{ color: "#00ff9d" }}>
                {computed.bmr} <span className="text-sm font-medium text-white/40">kcal/j</span>
              </p>
            </div>
            {/* TDEE card */}
            <div className="rounded-2xl p-5" style={{
              background: "linear-gradient(135deg, rgba(96,165,250,0.06), rgba(2,12,7,0.80))",
              border: "1px solid rgba(96,165,250,0.20)",
            }}>
              <p className="text-xs text-white/45 uppercase tracking-wider font-semibold mb-2">
                {locale === "fr" ? "D\u00e9pense Totale (TDEE)" : "Total Daily Energy (TDEE)"}
              </p>
              <p className="text-4xl font-black tabular-nums" style={{ color: "#60a5fa" }}>
                {computed.tdee} <span className="text-sm font-medium text-white/40">kcal/j</span>
              </p>
            </div>
            {/* Daily target */}
            <div className="rounded-2xl p-5" style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(2,12,7,0.80))",
              border: "1px solid rgba(245,158,11,0.20)",
            }}>
              <p className="text-xs text-white/45 uppercase tracking-wider font-semibold mb-2">
                {locale === "fr" ? "Objectif Calorique Quotidien" : "Daily Calorie Target"}
              </p>
              <p className="text-4xl font-black tabular-nums" style={{ color: "#f59e0b" }}>
                {computed.dailyTarget} <span className="text-sm font-medium text-white/40">kcal/j</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 4: Macros Reveal ═══ */}
      {step === 4 && (
        <div key="step-4" className={slideClass}>
          <AlixenAvatar />
          <AlixenBubble
            text="F\u00e9licitations ! Ton 'Parcours Vitalit\u00e9' est activ\u00e9. Voici tes briques de donn\u00e9es :"
          />
          <div className="space-y-4">
            {/* Protein */}
            <div className="rounded-2xl p-5 flex items-center gap-4" style={{
              background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(2,12,7,0.80))",
              border: "1px solid rgba(239,68,68,0.20)",
            }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
              }}>
                <Shield size={20} style={{ color: "#ef4444" }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/45 uppercase tracking-wider font-semibold">
                  {locale === "fr" ? "Prot\u00e9ines" : "Protein"}
                </p>
                <p className="text-2xl font-black tabular-nums text-red-400">
                  {macros.protein}g<span className="text-sm font-normal text-white/35 ml-1">/jour</span>
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  {locale === "fr"
                    ? "Les briques de ton corps. Elles construisent tes muscles."
                    : "Your body's building blocks. They build your muscles."}
                </p>
              </div>
            </div>
            {/* Carbs */}
            <div className="rounded-2xl p-5 flex items-center gap-4" style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(2,12,7,0.80))",
              border: "1px solid rgba(245,158,11,0.20)",
            }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
              }}>
                <Fuel size={20} style={{ color: "#f59e0b" }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/45 uppercase tracking-wider font-semibold">
                  {locale === "fr" ? "Glucides" : "Carbs"}
                </p>
                <p className="text-2xl font-black tabular-nums text-amber-400">
                  {macros.carbs}g<span className="text-sm font-normal text-white/35 ml-1">/jour</span>
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  {locale === "fr"
                    ? "Le super-carburant, comme de l'essence pour une voiture. Ils te donnent la force de bouger."
                    : "Super fuel, like gas for a car. They give you the energy to move."}
                </p>
              </div>
            </div>
            {/* Fat */}
            <div className="rounded-2xl p-5 flex items-center gap-4" style={{
              background: "linear-gradient(135deg, rgba(96,165,250,0.06), rgba(2,12,7,0.80))",
              border: "1px solid rgba(96,165,250,0.20)",
            }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)",
              }}>
                <Zap size={20} style={{ color: "#60a5fa" }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/45 uppercase tracking-wider font-semibold">
                  {locale === "fr" ? "Lipides" : "Fat"}
                </p>
                <p className="text-2xl font-black tabular-nums text-blue-400">
                  {macros.fat}g<span className="text-sm font-normal text-white/35 ml-1">/jour</span>
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  {locale === "fr"
                    ? "L'armure de tes cellules. Ils sont importants pour te prot\u00e9ger."
                    : "Your cells' armor. They protect your body."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="mt-4 px-4 py-3 rounded-xl text-sm text-red-400 font-medium"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)" }}>
          {error}
        </div>
      )}

      {/* ── Navigation buttons ── */}
      <div className="flex items-center gap-3 mt-8">
        {step > 0 && (
          <button type="button" onClick={goBack}
            className="px-5 py-3.5 rounded-xl text-sm font-semibold text-white/50 transition-colors hover:text-white/80"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {locale === "fr" ? "Retour" : "Back"}
          </button>
        )}

        {step < TOTAL_STEPS - 1 ? (
          <button type="button" onClick={goNext} className="lx-next-btn flex-1">
            <span className="flex items-center justify-center gap-2">
              {locale === "fr" ? "Suivant" : "Next"}
              <ChevronRight size={18} />
            </span>
          </button>
        ) : (
          <button type="button" onClick={handleFinish} disabled={syncing} className="lx-next-btn flex-1">
            {syncing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="lx-data-sync" />
                {locale === "fr" ? "Synchronisation..." : "Syncing..."}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {locale === "fr" ? "Activer mon Parcours" : "Activate my Journey"}
                <Zap size={18} />
              </span>
            )}
          </button>
        )}
      </div>

      {/* ── Login link ── */}
      <p className="text-center text-sm text-white/35 mt-6">
        {locale === "fr" ? "D\u00e9j\u00e0 un compte ?" : "Already have an account?"}{" "}
        <Link href={`/${locale}/login`} className="text-[#00ff9d] font-semibold hover:underline">
          {locale === "fr" ? "Se connecter" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
