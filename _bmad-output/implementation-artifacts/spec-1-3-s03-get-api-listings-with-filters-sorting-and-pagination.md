---
title: 'S03 - GET /api/listings with filters, sorting and pagination'
type: 'feature'
created: '2026-10-13'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The public site has no API to browse published listings; the search page, home page and map need filtered, sorted, paginated results with their ordered images.

**Approach:** Add `GET /api/listings` (Next.js App Router) backed by Supabase. Query params (`operation`, `neighborhood`, `min_price`, `max_price`, `bedrooms`, `bathrooms`, `property_type`, `sort`, `page`, `limit`) are validated in a pure parser; invalid values return 400 with per-field errors. Response is `{ data, total, page, limit, total_pages }`, each listing carrying images ordered by `position`.

</frozen-after-approval>

## Implementation Notes

- Decisions: `sort` defaults to `newest`; `page` default 1; `limit` default 12, max 50; `page` max 100000; `bedrooms`/`bathrooms` mean "at least N"; `neighborhood` is a case-insensitive exact match; unknown query params are ignored.
- Files: `src/lib/listings-query.ts` (parser), `src/lib/supabase-public.ts` (anon client), `src/app/api/listings/route.ts`, plus Vitest tests.

## Review Triage Log

- medium (patched): unbounded `page` lets `(page-1)*limit` exceed safe range → PostgREST error → 500. Added `MAX_PAGE` = 100000 → 400, with tests.
- false: null ordering on `price_cop`/`published_at` — `price_cop` is `not null` and `published_at` is filtered non-null.
- false: `PGRST103` fallback — it is the real PostgREST out-of-range code; covered by `listings.test.ts`.
- low (rejected): neighborhood is exact case-insensitive match — decided in Implementation Notes; accent-insensitive/partial search is a future enhancement.
- low (rejected): `select("*")` — every `listings` column is public by RLS design; no internal fields exist in the schema.
- low (rejected): cache headers, rate limiting, unknown-param rejection, repeated params, per-request client, loose `data` typing — hardening/ideas outside S03 scope; typing arrives with the UI stories.

### Review Findings

- [x] [Review][Patch] `bedrooms`/`bathrooms` accepted any safe integer; values above 32767 overflow the `smallint` columns and would surface as a 500 instead of a 400 [src/lib/listings-query.ts:55] — fixed: capped at `MAX_SMALLINT`, tests added
- [x] [Review][Defer] ilike on `neighborhood` — PostgREST treats `*` in `ilike` values as `%`, so "Gran*" is a wildcard rather than a literal [src/lib/listings.ts:30] — deferred: low severity, unverified without a live DB; confirm against PostgREST and decide whether to substitute or reject `*`

**Rejected:** duplicate query params use the first value (already rejected in triage log); unbounded `neighborhood` length (URL length limits bound it); client-side `published_at <= now()` clock skew (RLS enforces the real bound); exact `count` cost per request (acceptable at current scale).
