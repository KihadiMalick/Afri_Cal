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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-cream/95 backdrop-blur-md border-t-2 border-brand-brown-pale/20 z-50" style={{ boxShadow: "0 -4px 22px rgba(74, 52, 46, 0.09)", paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold tracking-wide transition-all duration-200 ${
                isActive ? "text-brand-terracotta" : "text-brand-brown-pale"
              }`}
            >
              <span className={`text-lg p-1 rounded-xl transition-all ${isActive ? "bg-brand-terracotta/10" : ""}`} style={isActive ? { boxShadow: "0 2px 8px rgba(217, 142, 79, 0.22)" } : undefined}>
                {getIcon(item.icon)}
              </span>
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
