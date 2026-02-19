"use client";

import { getDictionary, type Locale } from "@/i18n";

interface OnboardingFormProps {
  locale: Locale;
}

export default function OnboardingForm({ locale }: OnboardingFormProps) {
  const t = getDictionary(locale);

  return (
    <form className="card space-y-6">
      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.onboarding.gender}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="btn-secondary text-sm"
          >
            {t.onboarding.male}
          </button>
          <button
            type="button"
            className="btn-secondary text-sm"
          >
            {t.onboarding.female}
          </button>
        </div>
      </div>

      {/* Age */}
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
          {t.onboarding.age}
        </label>
        <input id="age" type="number" className="input-field" placeholder="25" />
      </div>

      {/* Weight */}
      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
          {t.onboarding.weight}
        </label>
        <input id="weight" type="number" className="input-field" placeholder="70" />
      </div>

      {/* Height */}
      <div>
        <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
          {t.onboarding.height}
        </label>
        <input id="height" type="number" className="input-field" placeholder="175" />
      </div>

      {/* Goal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.onboarding.goal}
        </label>
        <div className="space-y-2">
          {(["loseWeight", "maintainWeight", "gainWeight"] as const).map((goal) => (
            <button key={goal} type="button" className="btn-secondary w-full text-sm text-left">
              {t.onboarding[goal]}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.onboarding.activityLevel}
        </label>
        <div className="space-y-2">
          {(["sedentary", "light", "moderate", "active"] as const).map((level) => (
            <button key={level} type="button" className="btn-secondary w-full text-sm text-left">
              {t.onboarding[level]}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary w-full">
        {t.onboarding.complete}
      </button>
    </form>
  );
}
