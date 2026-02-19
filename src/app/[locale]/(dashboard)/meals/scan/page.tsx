import { getDictionary, isValidLocale } from "@/i18n";

export default function MealScanPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? params.locale : "fr";
  const t = getDictionary(locale);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t.meals.scanMeal}</h1>

      <div className="card flex flex-col items-center justify-center py-12">
        <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <span className="text-4xl">&#x1F4F7;</span>
        </div>
        <p className="text-gray-500 text-sm text-center">
          {/* Placeholder: Claude API integration in Phase 2 */}
          Prenez une photo de votre repas pour estimer les calories
        </p>
        <button className="btn-primary mt-6">
          {t.meals.scanMeal}
        </button>
      </div>
    </div>
  );
}
