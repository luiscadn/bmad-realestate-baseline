import { getTranslations, setRequestLocale } from "next-intl/server";
import SearchFilters, { type SearchFilterValues } from "@/components/SearchFilters";
import SearchResults from "@/components/SearchResults";
import type { FeaturedListing } from "@/lib/featured-listings";
import { fetchListings } from "@/lib/listings";
import { parseListingsQuery } from "@/lib/listings-query";
import { createPublicClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

const FILTER_KEYS = ["operation", "neighborhood", "property_type", "min_price", "max_price", "bedrooms", "bathrooms", "sort"] as const;

type RawParams = Record<string, string | string[] | undefined>;

/** Next gives repeated params as arrays; keep the first, like a single-valued form would. */
function toSearchParams(raw: RawParams): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) params.set(key, first);
  }
  return params;
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Search");

  const raw = toSearchParams(await searchParams);
  const parsed = parseListingsQuery(raw);
  const invalid = !parsed.ok;
  // Drop the invalid parameters only, so valid filters still apply.
  const cleaned = new URLSearchParams(raw);
  if (!parsed.ok) for (const key of Object.keys(parsed.errors)) cleaned.delete(key);
  const retry = parseListingsQuery(cleaned);
  const query = retry.ok ? retry.value : null;

  const values: SearchFilterValues = {};
  const linkQuery: Record<string, string> = {};
  for (const key of FILTER_KEYS) {
    const value = cleaned.get(key)?.trim();
    if (value) {
      values[key] = value;
      linkQuery[key] = value;
    }
  }

  let listings: FeaturedListing[] = [];
  let total = 0;
  let page = 1;
  let totalPages = 0;
  let failed = false;
  if (query) {
    try {
      const result = await fetchListings(createPublicClient(), query);
      listings = result.data as unknown as FeaturedListing[];
      ({ total, page, total_pages: totalPages } = result);
    } catch (error) {
      console.error("Search: could not load listings", error);
      failed = true;
    }
  } else {
    failed = true;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-emerald-950">{t("title")}</h1>
      <p className="mt-2 text-slate-600">{t("subtitle")}</p>
      {invalid ? (
        <p role="status" className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("results.invalid")}
        </p>
      ) : null}
      <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <aside>
          <SearchFilters key={JSON.stringify(values)} values={values} />
        </aside>
        <section aria-live="polite">
          <SearchResults listings={listings} total={total} page={page} totalPages={totalPages} query={linkQuery} failed={failed} />
        </section>
      </div>
    </div>
  );
}
