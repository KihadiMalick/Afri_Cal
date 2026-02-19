import { getDictionary, isValidLocale } from "@/i18n";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? params.locale : "fr";
  const t = getDictionary(locale);

  return (
    <div className="card">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-600">
          Afri<span className="text-accent-500">Calo</span>
        </h1>
        <p className="text-gray-500 mt-2">{t.common.tagline}</p>
      </div>
      <RegisterForm locale={locale} />
    </div>
  );
}
