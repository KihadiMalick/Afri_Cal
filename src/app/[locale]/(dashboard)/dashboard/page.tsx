import { getDictionary, isValidLocale } from "@/i18n";

export default function DashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? params.locale : "fr";
  const t = getDictionary(locale);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.title}</h1>

      {/* Calorie Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.goal}</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">--</p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.consumed}</p>
          <p className="text-2xl font-bold text-accent-500 mt-1">--</p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.burned}</p>
          <p className="text-2xl font-bold text-green-500 mt-1">--</p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">{t.dashboard.remaining}</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">--</p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t.meals.title}
          </h2>
          <p className="text-gray-400 text-sm">{t.common.noResults}</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t.activities.title}
          </h2>
          <p className="text-gray-400 text-sm">{t.common.noResults}</p>
        </div>
      </div>
    </div>
  );
}
