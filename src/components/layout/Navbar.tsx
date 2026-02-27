"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { createClient } from "@/lib/supabase";
import LanguageSelector from "./LanguageSelector";

export default function Navbar() {
  const { t, locale } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const currentLocale = (params?.locale as string) || locale;

  const navLinks = [
    { href: `/${currentLocale}/dashboard`, label: t.nav.dashboard },
    { href: `/${currentLocale}/meals`, label: t.nav.meals },
    { href: `/${currentLocale}/activities`, label: t.nav.activities },
    { href: `/${currentLocale}/calendar`, label: t.nav.calendar },
    { href: `/${currentLocale}/profile`, label: t.nav.profile },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(`/${currentLocale}/login`);
    router.refresh();
  }

  return (
    <nav className="bg-brand-cream/95 backdrop-blur-md border-b border-brand-brown-pale/20 sticky top-0 z-50 shadow-[0_2px_12px_rgba(74,52,46,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href={`/${currentLocale}/dashboard`}
            className="flex items-center gap-2"
          >
            <span className="text-2xl font-bold font-display text-brand-terracotta">
              Afri<span className="text-brand-gold-dark">Calo</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-brand-brown-light hover:text-brand-terracotta font-semibold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={handleLogout}
              className="text-sm text-brand-brown-pale hover:text-red-500 font-semibold transition-colors hidden md:block"
            >
              {t.auth.logout}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
