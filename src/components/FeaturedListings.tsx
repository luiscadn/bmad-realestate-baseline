import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { FeaturedListing } from "@/lib/featured-listings";

export default function FeaturedListings({ listings }: { listings: FeaturedListing[] }) {
  const t = useTranslations("Home");
  const format = useFormatter();

  return (
    <section aria-labelledby="featured-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
            {t("heroBadge", { default: "Ultra-Luxury Portfolio" })}
          </span>
          <h2 id="featured-title" className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            {t("featured.title")}
          </h2>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-800 shadow-xs transition-all hover:bg-slate-50 hover:shadow hover:text-slate-950"
        >
          <span>{t("featured.viewAll")}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      {listings.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white/50 p-12 text-center text-slate-600 backdrop-blur-xs">
          {t("featured.empty")}
        </p>
      ) : (
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => {
            const image = l.images[0];
            const hasUsd = l.price_usd != null && Number.isFinite(Number(l.price_usd));
            const price = hasUsd
              ? format.number(Number(l.price_usd), {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                })
              : format.number(Number(l.price_cop), {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                });
            return (
              <li key={l.id} className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <Link href={`/listings/${l.slug}`} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.url}
                        alt={image.alt_text ?? l.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-sm text-slate-400">{t("featured.noImage")}</span>
                    )}
                    <span className="absolute left-3.5 top-3.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
                      {l.operation === "sale" ? t("featured.forSale") : t("featured.forRent")}
                    </span>
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className="text-xl font-extrabold tracking-tight text-slate-950">
                      {price}
                      {l.operation === "rent" ? <span className="text-sm font-normal text-slate-500"> {t("featured.perMonth")}</span> : null}
                    </p>
                    <h3 className="mt-1.5 font-semibold text-slate-900 group-hover:text-emerald-900 transition-colors line-clamp-1">{l.title}</h3>
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {l.building_name ? (
                        <span
                          data-testid="building-badge"
                          className="inline-block rounded-full bg-slate-100 border border-slate-200/70 px-2.5 py-0.5 text-xs font-semibold text-slate-700"
                        >
                          {l.building_name}
                        </span>
                      ) : null}
                      <span
                        data-testid="neighborhood-badge"
                        className="inline-block rounded-full bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 text-xs font-medium text-emerald-950"
                      >
                        {l.neighborhood}
                      </span>
                    </div>
                    <p className="mt-3.5 flex flex-wrap gap-x-4 text-xs font-medium text-slate-500 pt-3 border-t border-slate-100">
                      <span>{t("featured.beds", { count: l.bedrooms })}</span>
                      <span>{t("featured.baths", { count: l.bathrooms })}</span>
                      {l.area_sqft ? (
                        <span data-testid="sqft-badge" className="font-semibold text-slate-700">{Number(l.area_sqft).toLocaleString()} sq ft</span>
                      ) : l.area_m2 ? (
                        <span>{t("featured.area", { count: Number(l.area_m2) })}</span>
                      ) : null}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
