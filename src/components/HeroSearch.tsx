"use client";

import type { FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PROPERTY_TYPES } from "@/lib/listings-query";
import { footerNeighborhoods } from "@/lib/site";

const fieldClass =
  "w-full rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-sm font-medium text-slate-800 transition-all focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer shadow-xs";

/** GET form that works without JS; with JS it drops empty fields so "no filter" never lands in the URL. */
export default function HeroSearch() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const router = useRouter();
  const action = locale === "es" ? "/search" : `/${locale}/search`;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string" && value) params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  return (
    <form
      method="get"
      action={action}
      onSubmit={onSubmit}
      role="search"
      aria-label={t("search.label")}
      className="grid gap-3 rounded-3xl bg-white/90 p-4 sm:p-5 shadow-2xl backdrop-blur-xl border border-white/60 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end transition-all hover:bg-white/95"
    >
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
        {t("search.operation")}
        <select name="operation" defaultValue="" className={`mt-1.5 ${fieldClass}`}>
          <option value="">{t("search.operationAny")}</option>
          <option value="sale">{t("search.sale")}</option>
          <option value="rent">{t("search.rent")}</option>
        </select>
      </label>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
        {t("search.neighborhood")}
        <select name="neighborhood" defaultValue="" className={`mt-1.5 ${fieldClass}`}>
          <option value="">{t("search.neighborhoodAny")}</option>
          {footerNeighborhoods.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
        {t("search.propertyType")}
        <select name="property_type" defaultValue="" className={`mt-1.5 ${fieldClass}`}>
          <option value="">{t("search.propertyTypeAny")}</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`propertyTypes.${type}`)}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="rounded-full bg-slate-950 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95 sm:col-span-2 lg:col-span-1 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>{t("search.submit")}</span>
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </button>
    </form>
  );
}
