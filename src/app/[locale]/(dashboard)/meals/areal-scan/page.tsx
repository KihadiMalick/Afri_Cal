"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { isValidLocale } from "@/i18n";

/* ══════════════════════════════════════════════════════════
   LIXUM Areal Scan — Redirect to Revealer Scan
   ──────────────────────────────────────────────────────────
   The Areal Scan has been replaced by the unified Revealer
   Scan experience. This page redirects to /meals/scan.
   ══════════════════════════════════════════════════════════ */
export default function ArealScanRedirect() {
  const params = useParams();
  const router = useRouter();
  const locale = isValidLocale(params?.locale as string) ? params.locale : "fr";

  useEffect(() => {
    router.replace(`/${locale}/meals/scan`);
  }, [locale, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: "#00ff9d", animation: "pulse 1s infinite" }}
        />
        <p className="text-white/50 text-sm font-medium">
          Redirection vers LIXUM Revealer…
        </p>
      </div>
    </div>
  );
}
