"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

export default function MobileNav() {
  const { t, locale } = useTranslation();
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = (params?.locale as string) || locale;

  const navItems = [
    { href: `/${currentLocale}/dashboard`, label: t.nav.dashboard, icon: "home" },
    { href: `/${currentLocale}/meals`, label: t.nav.meals, icon: "meals" },
    { href: `/${currentLocale}/activities`, label: t.nav.activities, icon: "activities" },
    { href: `/${currentLocale}/calendar`, label: t.nav.calendar, icon: "calendar" },
    { href: `/${currentLocale}/profile`, label: t.nav.profile, icon: "profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-600 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium transition-colors ${
                isActive ? "text-primary-400" : "text-dark-200"
              }`}
            >
              <span className="text-lg">{getIcon(item.icon)}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function getIcon(name: string): string {
  const icons: Record<string, string> = {
    home: "\u{1F3E0}",
    meals: "\u{1F372}",
    activities: "\u{1F3C3}",
    calendar: "\u{1F4C5}",
    profile: "\u{1F464}",
  };
  return icons[name] || "\u{25CF}";
}
