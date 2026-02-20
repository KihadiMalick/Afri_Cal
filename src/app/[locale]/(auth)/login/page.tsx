import { getDictionary, isValidLocale } from "@/i18n";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? params.locale : "fr";
  const t = getDictionary(locale);

  return (
    <div className="card animate-scale-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-400">
          Afri<span className="text-accent-400">Calo</span>
        </h1>
        <p className="text-dark-100 mt-2">{t.common.tagline}</p>
      </div>
      <LoginForm locale={locale} />
    </div>
  );
}
