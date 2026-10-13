import { useLocale, useTranslations } from "next-intl";
import { PROPERTY_TYPES } from "@/lib/listings-query";
import { footerNeighborhoods } from "@/lib/site";

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30";

/** Plain GET form: works without JS and keeps the current locale prefix. */
export default function HeroSearch() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const action = locale === "es" ? "/search" : `/${locale}/search`;

  return (
    <form
      method="get"
      action={action}
      role="search"
      aria-label={t("search.label")}
      className="grid gap-3 rounded-2xl bg-white p-4 shadow-xl sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
    >
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t("search.operation")}
        <select name="operation" defaultValue="" className={`mt-1 ${fieldClass}`}>
          <option value="">{t("search.operationAny")}</option>
          <option value="sale">{t("search.sale")}</option>
          <option value="rent">{t("search.rent")}</option>
        </select>
      </label>
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t("search.neighborhood")}
        <select name="neighborhood" defaultValue="" className={`mt-1 ${fieldClass}`}>
          <option value="">{t("search.neighborhoodAny")}</option>
          {footerNeighborhoods.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t("search.propertyType")}
        <select name="property_type" defaultValue="" className={`mt-1 ${fieldClass}`}>
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
        className="rounded-lg bg-emerald-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 sm:col-span-2 lg:col-span-1"
      >
        {t("search.submit")}
      </button>
    </form>
  );
}
