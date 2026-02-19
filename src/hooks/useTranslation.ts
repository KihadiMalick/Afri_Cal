"use client";

import { useParams } from "next/navigation";
import { getDictionary, type Locale, defaultLocale, isValidLocale } from "@/i18n";

export function useTranslation() {
  const params = useParams();
  const locale = typeof params?.locale === "string" && isValidLocale(params.locale)
    ? (params.locale as Locale)
    : defaultLocale;

  const t = getDictionary(locale);

  return { t, locale };
}
