import { getDictionary, isValidLocale } from "@/i18n";

export default function CalendarPage({
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
          {t.calendar.title}
        </h1>
        <button className="btn-secondary text-sm">{t.calendar.today}</button>
      </div>

      {/* Calendar placeholder */}
      <div className="card">
        <p className="text-center text-gray-400 py-12">
          {/* Placeholder: interactive monthly calendar in Phase 2 */}
          Le calendrier interactif sera affiché ici
        </p>
      </div>
    </div>
  );
}
