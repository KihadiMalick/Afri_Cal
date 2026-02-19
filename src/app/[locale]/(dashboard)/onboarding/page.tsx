import { getDictionary, isValidLocale } from "@/i18n";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default function OnboardingPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? params.locale : "fr";
  const t = getDictionary(locale);

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {t.onboarding.welcome}
        </h1>
        <p className="text-gray-500 mt-2">{t.onboarding.subtitle}</p>
      </div>
      <OnboardingForm locale={locale} />
    </div>
  );
}
