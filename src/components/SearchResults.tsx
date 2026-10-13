import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { SearchView } from "@/lib/map-view";
import ListingCard, { type ListingCardData } from "./ListingCard";
import SearchMapView from "./SearchMapView";

export interface SearchResultsProps {
  listings: ListingCardData[];
  total: number;
  page: number;
  totalPages: number;
  /** Active filters as URL params (without `page`), used to build pagination links. */
  query: Record<string, string>;
  failed?: boolean;
  view?: SearchView;
}

export default function SearchResults({ listings, total, page, totalPages, query, failed = false, view = "grid" }: SearchResultsProps) {
  const t = useTranslations("Search.results");
  const tFilters = useTranslations("Search.filters");
  const reset = (
    <Link
      href="/search"
      className="mt-4 inline-block rounded-lg bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
    >
      {tFilters("reset")}
    </Link>
  );

  if (failed) {
    return (
      <div role="alert" className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
        <p>{t("error")}</p>
        {reset}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <p className="text-lg font-semibold text-emerald-950">{t("empty")}</p>
        <p className="mt-2 text-slate-600">{t("emptyHint")}</p>
        {reset}
      </div>
    );
  }

  const baseQuery = view === "map" ? { ...query, view } : query;
  const pageHref = (p: number) => ({ pathname: "/search" as const, query: p > 1 ? { ...baseQuery, page: String(p) } : baseQuery });

  return (
    <div>
      <p className="text-sm text-slate-600" aria-live="polite">
        {t("count", { count: total })}
      </p>
      {view === "map" ? (
        <div className="mt-4">
          <SearchMapView listings={listings} />
        </div>
      ) : (
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing, index) => (
            <li key={listing.id}>
              <ListingCard listing={listing} priority={index < 3} />
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 ? (
        <nav aria-label={t("pagination")} className="mt-8 flex items-center justify-between gap-4 text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} rel="prev" className="font-medium text-emerald-800 hover:underline">
              ← {t("previous")}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-slate-600">{t("pageOf", { page, total: totalPages })}</span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} rel="next" className="font-medium text-emerald-800 hover:underline">
              {t("next")} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
