"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n";

const flags: Record<Locale, string> = {
  fr: "\u{1F1EB}\u{1F1F7}",
  en: "\u{1F1EC}\u{1F1E7}",
};

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as Locale) || "fr";

  function switchLocale(newLocale: Locale) {
    if (newLocale === currentLocale) return;
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  }

  return (
    <div className="flex items-center gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`text-xl transition-opacity hover:opacity-100 ${
            locale === currentLocale ? "opacity-100" : "opacity-50"
          }`}
          aria-label={`Switch to ${locale}`}
        >
          {flags[locale]}
        </button>
      ))}
    </div>
  );
}
