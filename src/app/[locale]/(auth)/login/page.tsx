import { isValidLocale } from "@/i18n";
import AlixenLoginForm from "@/components/auth/AlixenLoginForm";

export default function LoginPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? params.locale : "fr";

  return <AlixenLoginForm locale={locale} />;
}
