import { getDictionary, isValidLocale } from "@/i18n";

export default function ActivitiesPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? params.locale : "fr";
  const t = getDictionary(locale);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t.activities.title}
        </h1>
        <button className="btn-primary text-sm">
          {t.activities.addActivity}
        </button>
      </div>

      {/* Recommendation card */}
      <div className="card border-l-4 border-l-accent-400">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {t.activities.recommendation}
        </h2>
        <p className="text-gray-400 text-sm">
          {/* Placeholder: recommendations based on calorie surplus in Phase 2 */}
          Les recommandations sportives apparaîtront ici
        </p>
      </div>

      {/* Activity list */}
      <div className="card">
        <p className="text-gray-400 text-sm">{t.common.noResults}</p>
      </div>
    </div>
  );
}
