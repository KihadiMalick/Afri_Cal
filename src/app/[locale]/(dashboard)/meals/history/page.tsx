import { getDictionary, isValidLocale } from "@/i18n";

export default function MealHistoryPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? params.locale : "fr";
  const t = getDictionary(locale);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t.meals.history}</h1>

      <div className="card">
        <p className="text-gray-400 text-sm">{t.common.noResults}</p>
      </div>
    </div>
  );
}
