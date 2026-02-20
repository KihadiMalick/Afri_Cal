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
    <nav className="bg-dark-800 border-b border-dark-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href={`/${currentLocale}/dashboard`}
            className="flex items-center gap-2"
          >
            <span className="text-2xl font-bold text-primary-400">
              Afri<span className="text-accent-400">Calo</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-dark-100 hover:text-primary-400 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={handleLogout}
              className="text-sm text-dark-200 hover:text-red-400 font-medium transition-colors hidden md:block"
            >
              {t.auth.logout}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
