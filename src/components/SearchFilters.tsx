"use client";

import type { FocusEvent, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { PROPERTY_TYPES, SORTS } from "@/lib/listings-query";
import { footerNeighborhoods } from "@/lib/site";

/** Raw URL values (strings) of the active filters; missing key means "no filter". */
export type SearchFilterValues = Partial<
  Record<"operation" | "neighborhood" | "property_type" | "min_price" | "max_price" | "bedrooms" | "bathrooms" | "sort", string>
>;

const fieldClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30";
const labelClass = "block text-xs font-semibold uppercase tracking-wide text-slate-500";
const COUNTS = [1, 2, 3, 4, 5] as const;
const SORT_KEYS = { newest: "sortNewest", price_asc: "sortPriceAsc", price_desc: "sortPriceDesc" } as const;

/** GET form that works without JS; with JS every change rewrites the URL (empty fields dropped, page reset). */
export default function SearchFilters({ values }: { values: SearchFilterValues }) {
  const t = useTranslations("Search");
  const router = useRouter();

  const neighborhoods: string[] = [...footerNeighborhoods];
  if (values.neighborhood && !neighborhoods.includes(values.neighborhood)) neighborhoods.push(values.neighborhood);

  function push(form: HTMLFormElement) {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      if (typeof value === "string" && value.trim()) params.set(key, value.trim());
    }
    // "newest" is the default sort, so it never needs to live in the URL.
    if (params.get("sort") === "newest") params.delete("sort");
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  function onChange(event: FormEvent<HTMLFormElement>) {
    // Text-like inputs commit on blur or Enter, not on every keystroke.
    if (event.target instanceof HTMLInputElement) return;
    push(event.currentTarget);
  }

  function onBlur(event: FocusEvent<HTMLFormElement>) {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.value !== target.defaultValue) push(event.currentTarget);
  }

  return (
    <form
      method="get"
      action="/search"
      role="search"
      aria-label={t("filters.label")}
      onChange={onChange}
      onBlur={onBlur}
      onSubmit={(event) => {
        event.preventDefault();
        push(event.currentTarget);
      }}
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-base font-semibold text-emerald-950">{t("filters.title")}</h2>
      <label className={labelClass}>
        {t("filters.operation")}
        <select name="operation" defaultValue={values.operation ?? ""} className={fieldClass}>
          <option value="">{t("filters.operationAny")}</option>
          <option value="sale">{t("filters.sale")}</option>
          <option value="rent">{t("filters.rent")}</option>
        </select>
      </label>
      <label className={labelClass}>
        {t("filters.neighborhood")}
        <select name="neighborhood" defaultValue={values.neighborhood ?? ""} className={fieldClass}>
          <option value="">{t("filters.neighborhoodAny")}</option>
          {neighborhoods.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        {t("filters.propertyType")}
        <select name="property_type" defaultValue={values.property_type ?? ""} className={fieldClass}>
          <option value="">{t("filters.propertyTypeAny")}</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`propertyTypes.${type}`)}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        {t("filters.minPrice")}
        <input name="min_price" type="number" inputMode="numeric" min={0} step={1} defaultValue={values.min_price ?? ""} className={fieldClass} />
      </label>
      <label className={labelClass}>
        {t("filters.maxPrice")}
        <input name="max_price" type="number" inputMode="numeric" min={0} step={1} defaultValue={values.max_price ?? ""} className={fieldClass} />
      </label>
      <label className={labelClass}>
        {t("filters.bedrooms")}
        <select name="bedrooms" defaultValue={values.bedrooms ?? ""} className={fieldClass}>
          <option value="">{t("filters.countAny")}</option>
          {COUNTS.map((n) => (
            <option key={n} value={n}>
              {t("filters.countAtLeast", { count: n })}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        {t("filters.bathrooms")}
        <select name="bathrooms" defaultValue={values.bathrooms ?? ""} className={fieldClass}>
          <option value="">{t("filters.countAny")}</option>
          {COUNTS.map((n) => (
            <option key={n} value={n}>
              {t("filters.countAtLeast", { count: n })}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        {t("filters.sort")}
        <select name="sort" defaultValue={values.sort ?? "newest"} className={fieldClass}>
          {SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {t(`filters.${SORT_KEYS[sort]}`)}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
        >
          {t("filters.apply")}
        </button>
        <Link href="/search" className="text-sm font-medium text-emerald-800 hover:underline">
          {t("filters.reset")}
        </Link>
      </div>
    </form>
  );
}
