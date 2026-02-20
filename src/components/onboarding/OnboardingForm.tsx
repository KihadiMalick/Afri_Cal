"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { getDictionary, type Locale } from "@/i18n";
import { getCalorieCalculation } from "@/utils/calories";

interface OnboardingFormProps {
  locale: Locale;
}

type Gender = "male" | "female";
type Goal = "lose" | "maintain" | "gain";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

export default function OnboardingForm({ locale }: OnboardingFormProps) {
  const t = getDictionary(locale);
  const router = useRouter();
  const supabase = createClient();

  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState<Goal | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [targetWeightLoss, setTargetWeightLoss] = useState("");
  const [targetMonths, setTargetMonths] = useState<1 | 2 | 3>(3);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const goalMap: { key: Goal; label: string }[] = [
    { key: "lose", label: t.onboarding.loseWeight },
    { key: "maintain", label: t.onboarding.maintainWeight },
    { key: "gain", label: t.onboarding.gainWeight },
  ];

  const activityMap: { key: ActivityLevel; label: string }[] = [
    { key: "sedentary", label: t.onboarding.sedentary },
    { key: "light", label: t.onboarding.light },
    { key: "moderate", label: t.onboarding.moderate },
    { key: "active", label: t.onboarding.active },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!gender || !goal || !activityLevel) {
      setError(locale === "fr" ? "Veuillez remplir tous les champs" : "Please fill in all fields");
      return;
    }

    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const weightLossNum = goal === "lose" ? parseFloat(targetWeightLoss) || 5 : 0;

    if (!ageNum || !weightNum || !heightNum) {
      setError(locale === "fr" ? "Veuillez entrer des valeurs valides" : "Please enter valid values");
      return;
    }

    setLoading(true);

    // Calculate calories
    const { bmr, tdee, dailyTarget } = getCalorieCalculation(
      weightNum,
      heightNum,
      ageNum,
      gender,
      activityLevel,
      goal,
      weightLossNum,
      targetMonths
    );

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError(locale === "fr" ? "Vous devez être connecté" : "You must be logged in");
      setLoading(false);
      return;
    }

    // Upsert profile (insert or update if exists)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from("users_profile")
      .upsert(
        {
          user_id: user.id,
          full_name: user.email?.split("@")[0] || "",
          age: ageNum,
          weight: weightNum,
          height: heightNum,
          gender,
          goal,
          activity_level: activityLevel,
          target_months: targetMonths,
          target_weight_loss: weightLossNum,
          daily_calorie_target: dailyTarget,
          bmr,
          tdee,
          onboarding_completed: true,
        },
        { onConflict: "user_id" }
      );

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-2xl border border-red-500/20">
          {error}
        </div>
      )}

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-dark-100 mb-2">
          {t.onboarding.gender}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`px-4 py-3 rounded-2xl font-medium border transition-all ${
                gender === g
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-dark-700 text-gray-200 border-dark-500 hover:border-primary-500/50"
              }`}
            >
              {g === "male" ? t.onboarding.male : t.onboarding.female}
            </button>
          ))}
        </div>
      </div>

      {/* Age */}
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-dark-100 mb-1">
          {t.onboarding.age}
        </label>
        <input
          id="age"
          type="number"
          required
          min={10}
          max={120}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="input-field"
          placeholder="25"
        />
      </div>

      {/* Weight */}
      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-dark-100 mb-1">
          {t.onboarding.weight}
        </label>
        <input
          id="weight"
          type="number"
          required
          min={20}
          max={500}
          step={0.1}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="input-field"
          placeholder="70"
        />
      </div>

      {/* Height */}
      <div>
        <label htmlFor="height" className="block text-sm font-medium text-dark-100 mb-1">
          {t.onboarding.height}
        </label>
        <input
          id="height"
          type="number"
          required
          min={100}
          max={250}
          step={0.1}
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="input-field"
          placeholder="175"
        />
      </div>

      {/* Goal */}
      <div>
        <label className="block text-sm font-medium text-dark-100 mb-2">
          {t.onboarding.goal}
        </label>
        <div className="space-y-2">
          {goalMap.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setGoal(key)}
              className={`w-full px-4 py-3 rounded-2xl font-medium border text-left transition-all ${
                goal === key
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-dark-700 text-gray-200 border-dark-500 hover:border-primary-500/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Target weight loss (only for "lose") */}
      {goal === "lose" && (
        <>
          <div>
            <label htmlFor="targetWeightLoss" className="block text-sm font-medium text-dark-100 mb-1">
              {t.onboarding.targetWeightLoss}
            </label>
            <input
              id="targetWeightLoss"
              type="number"
              min={1}
              max={50}
              step={0.5}
              value={targetWeightLoss}
              onChange={(e) => setTargetWeightLoss(e.target.value)}
              className="input-field"
              placeholder="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-100 mb-2">
              {t.onboarding.period}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([1, 2, 3] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTargetMonths(m)}
                  className={`px-4 py-3 rounded-2xl font-medium border transition-all ${
                    targetMonths === m
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-dark-700 text-gray-200 border-dark-500 hover:border-primary-500/50"
                  }`}
                >
                  {t.onboarding[`months${m}` as keyof typeof t.onboarding]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Activity Level */}
      <div>
        <label className="block text-sm font-medium text-dark-100 mb-2">
          {t.onboarding.activityLevel}
        </label>
        <div className="space-y-2">
          {activityMap.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActivityLevel(key)}
              className={`w-full px-4 py-3 rounded-2xl font-medium border text-left transition-all ${
                activityLevel === key
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-dark-700 text-gray-200 border-dark-500 hover:border-primary-500/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? t.onboarding.calculating : t.onboarding.complete}
      </button>
    </form>
  );
}
