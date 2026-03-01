import { isValidLocale } from "@/i18n";
import AlixenRegisterForm from "@/components/auth/AlixenRegisterForm";

export default function RegisterPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? params.locale : "fr";

  return <AlixenRegisterForm locale={locale} />;
}
