import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { FeaturedListing } from "@/lib/featured-listings";

export type ListingCardData = FeaturedListing;

export default function ListingCard({ listing, priority = false }: { listing: ListingCardData; priority?: boolean }) {
  const t = useTranslations("Search.card");
  const format = useFormatter();
  const image = listing.images[0];
  const isRent = listing.operation === "rent";
  const hasUsd = listing.price_usd != null && Number.isFinite(Number(listing.price_usd));
  const price = hasUsd
    ? format.number(Number(listing.price_usd), {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      })
    : format.number(Number(listing.price_cop), {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      });

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link href={`/listings/${listing.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt_text ?? listing.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              priority={priority}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-sm text-slate-400">{t("noImage")}</span>
          )}
          <span
            data-testid="operation-badge"
            className="absolute left-3.5 top-3.5 rounded-full bg-slate-950/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur-md border border-white/20"
          >
            {isRent ? t("forRent") : t("forSale")}
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-xl font-extrabold tracking-tight text-slate-950">
            {price}
            {isRent ? <span className="text-sm font-normal text-slate-500"> {t("perMonth")}</span> : null}
          </p>
          <h3 className="mt-1.5 font-semibold text-slate-900 group-hover:text-emerald-900 transition-colors line-clamp-1">{listing.title}</h3>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {listing.building_name ? (
              <span
                data-testid="building-badge"
                className="inline-block rounded-full bg-slate-100 border border-slate-200/70 px-2.5 py-0.5 text-xs font-semibold text-slate-700"
              >
                {listing.building_name}
              </span>
            ) : null}
            <span
              data-testid="neighborhood-badge"
              className="inline-block rounded-full bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 text-xs font-medium text-emerald-900"
            >
              {listing.neighborhood}
            </span>
          </div>
          <p className="mt-3.5 flex flex-wrap gap-x-4 text-xs font-medium text-slate-500 pt-3 border-t border-slate-100">
            <span>{t("beds", { count: listing.bedrooms })}</span>
            <span>{t("baths", { count: listing.bathrooms })}</span>
            {listing.area_sqft ? (
              <span data-testid="sqft-badge" className="font-semibold text-slate-700">{Number(listing.area_sqft).toLocaleString()} sq ft</span>
            ) : listing.area_m2 ? (
              <span>{t("area", { count: Number(listing.area_m2) })}</span>
            ) : null}
          </p>
        </div>
      </Link>
    </article>
  );
}
