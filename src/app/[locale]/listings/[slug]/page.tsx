import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import ContactForm from "@/components/ContactForm";
import ListingGallery from "@/components/ListingGallery";
import OpenHouseBanner from "@/components/OpenHouseBanner";
import type { ListingDetail } from "@/lib/listing-detail";
import { fetchListingBySlug } from "@/lib/listings";
import { createPublicClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Deduplicated per request: generateMetadata and the page share one query. */
const findListing = cache(async (slug: string) => fetchListingBySlug(createPublicClient(), slug));

async function loadListing(slug: string): Promise<ListingDetail> {
  const listing = await findListing(slug);
  if (!listing) notFound();
  return listing as unknown as ListingDetail;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await findListing(slug);
  if (!listing) return {};
  const description = String(listing.description ?? "").slice(0, 160);
  return { title: String(listing.title), ...(description ? { description } : {}) };
}

export default async function ListingPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const listing = await loadListing(slug);
  const t = await getTranslations("Listing");
  const tTypes = await getTranslations("Search.propertyTypes");
  const format = await getFormatter();

  const cop = (value: number | string) =>
    format.number(Number(value), { style: "currency", currency: "COP", maximumFractionDigits: 0 });
  const isRent = listing.operation === "rent";
  const { agent } = listing;

  const facts: [string, string][] = [
    [t("facts.bedrooms"), String(listing.bedrooms)],
    [t("facts.bathrooms"), String(listing.bathrooms)],
    [t("facts.parking"), String(listing.parking_spots)],
  ];
  if (listing.area_m2) facts.push([t("facts.area"), t("facts.areaValue", { count: Number(listing.area_m2) })]);
  if (listing.stratum) facts.push([t("facts.stratum"), String(listing.stratum)]);
  if (listing.admin_fee_cop != null) facts.push([t("facts.adminFee"), cop(listing.admin_fee_cop)]);

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          {listing.open_house_at ? <OpenHouseBanner openHouseAt={listing.open_house_at} /> : null}
          <ListingGallery images={listing.images} title={listing.title} />

          <header>
            <p className="flex flex-wrap gap-2 text-xs font-semibold">
              <span data-testid="operation-badge" className="rounded-full bg-emerald-900 px-3 py-1 text-white">
                {isRent ? t("forRent") : t("forSale")}
              </span>
              <span data-testid="type-badge" className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-900">
                {tTypes(listing.property_type)}
              </span>
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-emerald-950">{listing.title}</h1>
            <p className="mt-2 text-2xl font-semibold text-emerald-900">
              {cop(listing.price_cop)}
              {isRent ? <span className="text-base font-normal text-slate-500"> {t("perMonth")}</span> : null}
            </p>
            <p className="mt-2 text-slate-600">
              {listing.neighborhood}
              {listing.address ? ` · ${listing.address}` : ""}
              {listing.city ? `, ${listing.city}` : ""}
            </p>
          </header>

          <section aria-labelledby="facts-title">
            <h2 id="facts-title" className="text-lg font-semibold text-emerald-950">
              {t("facts.title")}
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {facts.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 p-4">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className="mt-1 font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {listing.description ? (
            <section aria-labelledby="description-title">
              <h2 id="description-title" className="text-lg font-semibold text-emerald-950">
                {t("description")}
              </h2>
              <p className="mt-3 whitespace-pre-line text-slate-700">{listing.description}</p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          {agent ? (
            <section aria-labelledby="agent-title" className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 id="agent-title" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("agent.title")}
              </h2>
              <p className="mt-2 font-semibold text-emerald-950">{agent.full_name}</p>
              {agent.bio ? <p className="mt-1 text-sm text-slate-600">{agent.bio}</p> : null}
              <p className="mt-3 space-y-1 text-sm">
                {agent.phone ? (
                  <a href={`tel:${agent.phone.replace(/[^\d+]/g, "")}`} className="block text-emerald-800 hover:underline">
                    {agent.phone}
                  </a>
                ) : null}
                <a href={`mailto:${agent.email}`} className="block text-emerald-800 hover:underline">
                  {agent.email}
                </a>
              </p>
            </section>
          ) : null}
          <ContactForm listingId={listing.id} />
        </aside>
      </div>
    </article>
  );
}
