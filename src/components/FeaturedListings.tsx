import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { FeaturedListing } from "@/lib/featured-listings";

export default function FeaturedListings({ listings }: { listings: FeaturedListing[] }) {
  const t = useTranslations("Home");
  const format = useFormatter();

  return (
    <section aria-labelledby="featured-title" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <h2 id="featured-title" className="text-2xl font-semibold text-emerald-950">
          {t("featured.title")}
        </h2>
        <Link href="/search" className="text-sm font-medium text-emerald-800 hover:underline">
          {t("featured.viewAll")} →
        </Link>
      </div>
      {listings.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
          {t("featured.empty")}
        </p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              <li key={l.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Link href={`/listings/${l.slug}`} className="block">
                  <div className="relative aspect-[16/10] bg-slate-100">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image.url} alt={image.alt_text ?? l.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-sm text-slate-400">{t("featured.noImage")}</span>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold text-white">
                      {l.operation === "sale" ? t("featured.forSale") : t("featured.forRent")}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-lg font-semibold text-emerald-950">
                      {price}
                      {l.operation === "rent" ? <span className="text-sm font-normal text-slate-500"> {t("featured.perMonth")}</span> : null}
                    </p>
                    <h3 className="mt-1 font-medium text-slate-800">{l.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {l.building_name ? (
                        <span
                          data-testid="building-badge"
                          className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700"
                        >
                          {l.building_name}
                        </span>
                      ) : null}
                      <span data-testid="neighborhood-badge" className="text-sm text-slate-500">
                        {l.neighborhood}
                      </span>
                    </div>
                    <p className="mt-3 flex flex-wrap gap-x-4 text-sm text-slate-600">
                      <span>{t("featured.beds", { count: l.bedrooms })}</span>
                      <span>{t("featured.baths", { count: l.bathrooms })}</span>
                      {l.area_sqft ? (
                        <span data-testid="sqft-badge">{Number(l.area_sqft).toLocaleString()} sq ft</span>
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
