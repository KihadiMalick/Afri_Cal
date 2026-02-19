"use client";

import Link from "next/link";
import { getDictionary, type Locale } from "@/i18n";

interface RegisterFormProps {
  locale: Locale;
}

export default function RegisterForm({ locale }: RegisterFormProps) {
  const t = getDictionary(locale);

  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          {t.auth.email}
        </label>
        <input
          id="email"
          type="email"
          className="input-field"
          placeholder={t.auth.email}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          {t.auth.password}
        </label>
        <input
          id="password"
          type="password"
          className="input-field"
          placeholder={t.auth.password}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          {t.auth.confirmPassword}
        </label>
        <input
          id="confirmPassword"
          type="password"
          className="input-field"
          placeholder={t.auth.confirmPassword}
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        {t.auth.register}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-400">ou</span>
        </div>
      </div>

      <button type="button" className="btn-secondary w-full">
        {t.auth.googleLogin}
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        {t.auth.hasAccount}{" "}
        <Link
          href={`/${locale}/login`}
          className="text-primary-600 font-medium hover:text-accent-500"
        >
          {t.auth.login}
        </Link>
      </p>
    </form>
  );
}
