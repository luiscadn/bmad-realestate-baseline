import { useTranslations } from "next-intl";

const ITEMS = ["neighborhoods", "buying", "investing"] as const;

export default function ResourceCards() {
  const t = useTranslations("Home.resources");
  return (
    <section aria-labelledby="resources-title" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h2 id="resources-title" className="text-2xl font-semibold text-emerald-950">
        {t("title")}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">{t("subtitle")}</p>
      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {ITEMS.map((key) => (
          <li key={key}>
            <article className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{t(`items.${key}.category`)}</p>
              <h3 className="mt-2 text-lg font-semibold text-emerald-950">{t(`items.${key}.title`)}</h3>
              <p className="mt-2 text-sm text-slate-600">{t(`items.${key}.excerpt`)}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
