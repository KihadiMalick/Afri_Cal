import { getDictionary, isValidLocale } from "@/i18n";

export default function ProfilePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? params.locale : "fr";
  const t = getDictionary(locale);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t.profile.title}</h1>

      {/* Profile card */}
      <div className="card flex flex-col items-center py-8">
        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
          <span className="text-3xl">&#x1F464;</span>
        </div>
        <p className="text-gray-400 text-sm">--</p>
      </div>

      {/* Settings */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {t.profile.settings}
        </h2>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">{t.profile.language}</span>
          <span className="text-gray-400 text-sm">{locale.toUpperCase()}</span>
        </div>

        <button className="btn-primary w-full">{t.profile.editProfile}</button>
        <button className="btn-secondary w-full text-red-500 border-red-200 hover:bg-red-50">
          {t.auth.logout}
        </button>
      </div>
    </div>
  );
}
