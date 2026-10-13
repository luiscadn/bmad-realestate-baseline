---
title: 'S09 - ListingCard and results grid with filters panel'
type: 'feature'
created: '2026-10-13'
status: 'done'
baseline_commit: '846c20ca2e7814d9c67412b9a1131fcb25e36612'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/search` does not exist; Home, the nav and the footer link to it. Visitors cannot browse or filter published listings.

**Approach:** Server-rendered `/[locale]/search` reads URL params through the existing `parseListingsQuery` and `fetchListings`. A client filter panel rewrites the URL on change, so the server re-renders the results. A reusable `ListingCard` uses `next/image`.

## Boundaries & Constraints

**Always:** All visible strings come from next-intl (`Search` namespace, es and en with key parity). URL param names match the API (`operation`, `neighborhood`, `property_type`, `min_price`, `max_price`, `bedrooms`, `bathrooms`, `sort`, `page`). Empty params are never put in the URL. Prices are formatted as COP with `useFormatter`. The filter form works as a plain GET form without JS.

**Never:** No map toggle (S11). No detail page (S10). No change to the API or DB. Do not refactor `FeaturedListings`. No new dependencies.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Filtered results | `?operation=rent&bedrooms=2` | Grid of cards; filters preselected; result count | N/A |
| Empty | no listing matches | Fallback message and a "clear filters" link to `/search` | N/A |
| Invalid params | `?bedrooms=abc` | Defaults are used, a notice is shown, the filter panel stays usable | No throw |
| Fetch failure | Supabase error | Error message with a reset link | Logged; page does not 500 |
| Card without image | `images: []` | "No photo" placeholder | N/A |
| Rent card | `operation=rent` | Price shows a "/month" suffix | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/listings.ts` `fetchListings`, `src/lib/listings-query.ts` `parseListingsQuery`/`PROPERTY_TYPES`/`SORTS` -- reuse as is
- `src/lib/featured-listings.ts` `FeaturedListing` -- the card data shape
- `src/components/HeroSearch.tsx` -- pattern for the filter form (drop empty params, `router.push`)
- `src/components/FeaturedListings.tsx` -- visual style reference only
- `src/test/setup.tsx`, `src/test/render.tsx` -- mocks for navigation, `renderWithIntl`
- `src/lib/site.ts` `footerNeighborhoods` -- neighborhood options
- `next.config.ts` -- needs `images.remotePatterns`

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/image-hosts.ts` + test -- build `remotePatterns` from `NEXT_PUBLIC_SUPABASE_URL` (path `/storage/v1/object/public/listing-images/**`); allow local IPs only for a local host
- [x] `next.config.ts` -- use it for `images`
- [x] `messages/{es,en}.json` -- add the `Search` namespace
- [x] `src/components/ListingCard.tsx` + test -- image, COP price, beds, baths, m², neighborhood and operation badges, link to `/listings/[slug]`
- [x] `src/components/SearchFilters.tsx` + test -- panel with the 7 controls, push on change, reset
- [x] `src/components/SearchResults.tsx` -- grid, count, empty and error states, pagination links
- [x] `src/app/[locale]/search/page.tsx` + test -- parse, fetch, render
- [x] Extend the i18n parity test if one exists

**Acceptance Criteria:**
- Given a change in any filter control, when it fires, then the router pushes `/search?...` with only the non-empty params, and `page` is reset.
- Given a listing, when the card renders, then it shows the image (`next/image`), the COP price, bedrooms, bathrooms, m², the neighborhood badge and the operation badge, and links to `/listings/{slug}`.
- Given zero results, when the page renders, then it shows the fallback message and a clear-filters link.
- Given es and en catalogs, then the key sets are identical.
- `npx vitest run`, `npx tsc --noEmit`, `npm run lint` and `npm run build` all pass.

## Implementation Notes

- Installed Next is 15.5.27, which has no `dangerouslyAllowLocalIP`. Local Supabase images work without it, so `image-hosts.ts` only builds the allow-list.
- Price inputs commit on blur or Enter, not per keystroke. Selects commit on change.
- Invalid params are dropped one by one. The valid filters still apply, and a status notice is shown.
- The `ListingCard` strings live in `Search.card`. `FeaturedListings` was left untouched, as the spec says.
- Verified: `vitest run` 230/230, `tsc --noEmit`, `npm run lint` and `npm run build` all pass. The edit that adds the `remotePatterns` check was not run against a live Supabase.

## Spec Change Log

## Review Triage Log

### Review Findings

- [x] [Review][Patch] No-JS GET form posted to `/search` and dropped the `en` locale [src/components/SearchFilters.tsx] — fixed: action carries the locale prefix; test added
- [x] [Review][Patch] Nested `aria-live` (section + count) announced the whole results region [src/app/[locale]/search/page.tsx] — fixed: removed from the section
- [x] [Review][Defer] Page past the last page shows "no properties match" although total > 0 [src/components/SearchResults.tsx:36] — deferred: only reachable through stale links; fix needs new copy and a branch
- [x] [Review][Defer] `remotePatterns` is read at build time; images from any other host are not optimized [next.config.ts:10] — deferred: matches the spec; revisit if non-Supabase image URLs appear

**Rejected:** `number` inputs accept `1e5` (server drops it and shows the notice; harmless). Blur-then-Enter double push (the second push is identical, and the form remounts on the new URL).
