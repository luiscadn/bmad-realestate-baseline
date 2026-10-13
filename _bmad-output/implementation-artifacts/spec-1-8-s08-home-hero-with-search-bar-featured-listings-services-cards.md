---
title: 'S08 - Home hero with search bar, featured listings, services cards'
type: 'feature'
created: '2026-10-13'
status: 'in-review'
route: 'dispatch'
review_loop_iteration: 0
context: ['{project-root}/docs/design-reference.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/` is a placeholder; visitors have no entry point to search, featured properties, process or services.

**Approach:** Build the Home page with a hero ("Encuentra el espacio que te mueve") and quick search bar (operation, neighborhood, property type) that submits to `/search` with query params, a featured listings grid, a 3-step process and Buy/Sell/Rent service cards. All strings come from the es/en catalogs.

## Boundaries & Constraints

**Always:** Search param names match `listings-query.ts` (`operation`, `neighborhood`, `property_type`); empty fields are omitted. Search goes to the current locale's `/search`. Featured fetch failure or no rows renders a fallback, never crashes the page.

**Never:** Build `/search`, `/contact` or the full `ListingCard` (S09). Change API routes or the schema. Hardcode visible strings.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Search | operation=sale, neighborhood=Granada | `/search?operation=sale&neighborhood=Granada` (`/en/search` in English) | N/A |
| Empty search | nothing selected | `/search` | N/A |
| Featured | published listings exist | up to 6 cards, featured first then newest | N/A |
| No data / DB error | none or fetch throws | empty-state message | caught, logged |
| Catalog parity | es.json vs en.json | identical keys | test fails otherwise |

</frozen-after-approval>

## Code Map

- `src/app/[locale]/page.tsx` -- placeholder home to replace; layout already supplies header/main/footer.
- `src/lib/listings.ts`, `supabase-public.ts` -- `createPublicClient`, published-listing filter pattern, `orderImages`.
- `src/lib/site.ts` -- `footerNeighborhoods` reused for neighborhood options.
- `src/lib/listings-query.ts` -- `PROPERTY_TYPES`, param names.
- `src/test/setup.tsx`, `render.tsx` -- mocked `@/i18n/navigation` Link; `renderWithIntl`.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/featured-listings.ts` -- fetch published listings, featured first, with images
- [x] `src/components/HeroSearch.tsx`, `FeaturedListings.tsx`, `HomeSections.tsx` -- components
- [x] `src/app/[locale]/page.tsx` -- compose page
- [x] `messages/es.json`, `en.json` -- `Home` namespace
- [x] tests for each

**Acceptance Criteria:**
- Given the Home page, when the search form is submitted, then it targets `/search` with only the chosen params.
- Given featured data, then cards show title, neighborhood, COP price; with none, a fallback shows.
- Given es or en, then the process (3 steps) and services (3 cards) render in that language.
- Given `npm run build` and `npm test`, then both pass.

## Verification

**Commands:**
- `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`
