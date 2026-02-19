"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSelector from "./LanguageSelector";

export default function Navbar() {
  const { t, locale } = useTranslation();
  const params = useParams();
  const currentLocale = (params?.locale as string) || locale;

  const navLinks = [
    { href: `/${currentLocale}/dashboard`, label: t.nav.dashboard },
    { href: `/${currentLocale}/meals`, label: t.nav.meals },
    { href: `/${currentLocale}/activities`, label: t.nav.activities },
    { href: `/${currentLocale}/calendar`, label: t.nav.calendar },
    { href: `/${currentLocale}/profile`, label: t.nav.profile },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={`/${currentLocale}/dashboard`}
            className="flex items-center gap-2"
          >
            <span className="text-2xl font-bold text-primary-600">
              Afri<span className="text-accent-500">Calo</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-4">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </nav>
  );
}
