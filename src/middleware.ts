import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase-middleware";

const locales = ["fr", "en"];
const defaultLocale = "fr";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/onboarding",
  "/meals",
  "/activities",
  "/calendar",
  "/profile",
];

const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Redirect root to default locale
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}/dashboard`, request.url)
    );
  }

  // Add locale prefix if missing
  if (!pathnameHasLocale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
  }

  // Extract locale and path without locale
  const segments = pathname.split("/");
  const locale = segments[1];
  const pathWithoutLocale = "/" + segments.slice(2).join("/");

  // Refresh session and get user
  const { user, supabaseResponse } = await updateSession(request);

  // If on protected route and NOT logged in -> redirect to login
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If on auth route (login/register) and ALREADY logged in -> redirect to dashboard
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  if (isAuthRoute && user) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons).*)",
  ],
};
