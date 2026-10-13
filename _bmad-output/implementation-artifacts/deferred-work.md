
## Deferred from: code review of spec-1-2-s02 (2026-10-13)
- Listing deletion cascades `listing_images` rows but orphans storage objects; needs cleanup trigger/job.
- No per-listing image count cap in upload service.

## Deferred from: code review of spec-1-3-s03 (2026-10-13)

- `GET /api/listings` `neighborhood` filter: PostgREST maps `*` in `ilike` values to `%`, so `Gran*` acts as a wildcard rather than an exact match. Low severity; verify against a live PostgREST, then substitute or reject `*`.

## Deferred from: code review of spec-1-5-s05 (2026-10-13)

- `POST /api/leads` has no rate limiting, spam protection (honeypot/CAPTCHA) or request body size limit.
- `POST /api/leads` route tests mock the Supabase client; add a local-Supabase integration check that anon insert works under the "anyone submits leads" policy.
- Unknown or unpublished `listing_id` returns 500 (FK/RLS 23503/42501) per the story; consider mapping to 400 once the form can send stale listings.
- Leads are stored only; no agent notification (email/webhook) exists yet.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-s06-authenticated-agent-crud-for-listings-publish-and-unpublish.md`
  summary: Re-publishing an already-published listing resets `published_at`.
  evidence: PATCH `published: true` always writes now(); preserving the original date needs a read-before-write or a DB-side coalesce.

## Deferred from: code review of spec-1-8-s08 (2026-10-13)
- Featured images use raw `<img>` with full-size originals; move to `next/image` + `remotePatterns` for the Supabase host (with S09 ListingCard).
- Home "Sell" card (`/contact`) and "View all" (`/search`) 404 until S09/contact page exist.
- `revalidate = 300` caches the empty fallback for 5 minutes after a transient fetch failure.

## Deferred from: code review of spec-1-9-s09 (2026-10-13)
- Page past the last page shows "no properties match" although total > 0 [src/components/SearchResults.tsx:36]; only reachable through stale links; fix needs new copy and a branch.
- `remotePatterns` is read at build time; images from any other host are not optimized [next.config.ts:10]; matches spec; revisit if non-Supabase image URLs appear.


## Deferred from: spec-1-10-s10
- Contact form gives the same generic error for 400 and 500; field-level server errors are not mapped back to inputs.
- Open-house countdown and "no photo" states have no e2e/browser coverage; only jsdom tests.
- Seed data has no `stratum` / `admin_fee_cop` values; apply migration `20261013000200` locally before checking the facts grid.

## Deferred from: code review of spec-1-11-s11 (2026-10-13)
- Pins at identical coordinates stack, so only the top one is clickable.
- The preview card can cover pins near the bottom of the map.
- Rent and sale pins share styling (no "/month" on rent pins).
- On mobile the default tab is "map", so the selected-card ring in the list is hidden. Selecting a pin doesn't scroll to its card, and clicking a card doesn't select its pin.
- After the preview closes, focus doesn't return to the pin.
- A stale `selectedId` can survive a page change.
- The map only covers the current page of results.

