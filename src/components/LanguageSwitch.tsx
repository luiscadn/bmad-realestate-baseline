"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export default function LanguageSwitch() {
  const t = useTranslations("Language");
  const current = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-xs font-semibold"
    >
      {routing.locales.map((locale: Locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={{ pathname, query }}
            locale={locale}
            hrefLang={locale}
            lang={locale}
            aria-current={active ? "true" : undefined}
            aria-label={t(`${locale}Name`)}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              active
                ? "bg-emerald-950 text-white"
                : "text-slate-600 hover:text-emerald-950"
            }`}
          >
            {t(locale)}
          </Link>
        );
      })}
    </div>
  );
}
