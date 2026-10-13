import { useTranslations } from "next-intl";

const ITEMS = ["first", "second", "third"] as const;

export default function Testimonials() {
  const t = useTranslations("Home.testimonials");
  return (
    <section aria-labelledby="testimonials-title" className="bg-emerald-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 id="testimonials-title" className="text-2xl font-semibold text-emerald-950">
          {t("title")}
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {ITEMS.map((key) => (
            <li key={key}>
              <figure className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-900/10">
                <blockquote className="flex-1 text-sm text-slate-700">“{t(`items.${key}.quote`)}”</blockquote>
                <figcaption className="mt-4">
                  <span className="block text-sm font-semibold text-emerald-950">{t(`items.${key}.name`)}</span>
                  <span className="block text-xs text-slate-500">{t(`items.${key}.role`)}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
