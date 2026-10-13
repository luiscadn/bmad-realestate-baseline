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
  const price = format.number(Number(listing.price_cop), {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/listings/${listing.slug}`} className="block">
        <div className="relative aspect-[16/10] bg-slate-100">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt_text ?? listing.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              priority={priority}
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-sm text-slate-400">{t("noImage")}</span>
          )}
          <span
            data-testid="operation-badge"
            className="absolute left-3 top-3 rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold text-white"
          >
            {isRent ? t("forRent") : t("forSale")}
          </span>
        </div>
        <div className="p-5">
          <p className="text-lg font-semibold text-emerald-950">
            {price}
            {isRent ? <span className="text-sm font-normal text-slate-500"> {t("perMonth")}</span> : null}
          </p>
          <h3 className="mt-1 font-medium text-slate-800">{listing.title}</h3>
          <p className="mt-2">
            <span
              data-testid="neighborhood-badge"
              className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-900"
            >
              {listing.neighborhood}
            </span>
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4 text-sm text-slate-600">
            <span>{t("beds", { count: listing.bedrooms })}</span>
            <span>{t("baths", { count: listing.bathrooms })}</span>
            {listing.area_m2 ? <span>{t("area", { count: Number(listing.area_m2) })}</span> : null}
          </p>
        </div>
      </Link>
    </article>
  );
}
