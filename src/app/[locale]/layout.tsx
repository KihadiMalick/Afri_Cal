import type { Metadata } from "next";
import { locales, getDictionary, isValidLocale } from "@/i18n";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = isValidLocale(params.locale) ? params.locale : "fr";
  const t = getDictionary(locale);

  return {
    title: `${t.common.appName} - ${t.common.tagline}`,
    description: t.common.tagline,
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? params.locale : "fr";

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pb-20 md:pb-0">{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
