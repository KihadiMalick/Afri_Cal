import Link from "next/link";
import { getDictionary, isValidLocale } from "@/i18n";

export default function MealsPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? params.locale : "fr";
  const t = getDictionary(locale);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t.meals.title}</h1>
        <div className="flex gap-3">
          <Link href={`/${locale}/meals/scan`} className="btn-secondary text-sm">
            {t.meals.scanMeal}
          </Link>
          <button className="btn-primary text-sm">{t.meals.addMeal}</button>
        </div>
      </div>

      {/* Meal type sections */}
      {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
        <div key={type} className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            {t.meals[type]}
          </h2>
          <p className="text-gray-400 text-sm">{t.common.noResults}</p>
        </div>
      ))}
    </div>
  );
}
