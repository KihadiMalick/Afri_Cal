"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

function CallbackHandler() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "fr";
  const supabase = createClient();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          router.push(`/${locale}/login`);
        } else {
          router.push(`/${locale}/dashboard`);
        }
      });
    } else {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          router.push(`/${locale}/dashboard`);
        } else {
          router.push(`/${locale}/login`);
        }
      });
    }
  }, [router, locale, searchParams, supabase]);

  return null;
}

export default function AuthCallbackPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        <p className="mt-4 text-gray-500">
          {locale === "fr" ? "Authentification en cours..." : "Authenticating..."}
        </p>
      </div>
      <Suspense fallback={null}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
