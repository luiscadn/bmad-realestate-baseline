
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
