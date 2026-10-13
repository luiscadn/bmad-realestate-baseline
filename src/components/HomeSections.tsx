import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STEPS = ["talk", "clarify", "move"] as const;
const SERVICES = [
  { key: "buy", href: "/search?operation=sale" },
  { key: "sell", href: "/contact" },
  { key: "rent", href: "/search?operation=rent" },
] as const;

export function ProcessSteps() {
  const t = useTranslations("Home.process");
  return (
    <section aria-labelledby="process-title" className="bg-emerald-950 py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 id="process-title" className="text-2xl font-semibold">
          {t("title")}
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <span className="text-sm font-semibold text-amber-300">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-lg font-semibold">{t(`steps.${step}.title`)}</h3>
              <p className="mt-2 text-sm text-emerald-100/80">{t(`steps.${step}.description`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ServiceCards() {
  const t = useTranslations("Home.services");
  return (
    <section aria-labelledby="services-title" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h2 id="services-title" className="text-2xl font-semibold text-emerald-950">
        {t("title")}
      </h2>
      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {SERVICES.map(({ key, href }) => (
          <li key={key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-emerald-950">{t(`${key}.title`)}</h3>
            <p className="mt-2 text-sm text-slate-600">{t(`${key}.description`)}</p>
            <Link href={href} className="mt-4 inline-block text-sm font-medium text-emerald-800 hover:underline">
              {t("learnMore")} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
