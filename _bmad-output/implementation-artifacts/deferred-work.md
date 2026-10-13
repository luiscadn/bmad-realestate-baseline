
## Deferred from: code review of spec-1-2-s02 (2026-10-13)
- Listing deletion cascades `listing_images` rows but orphans storage objects; needs cleanup trigger/job.
- No per-listing image count cap in upload service.

## Deferred from: code review of spec-1-3-s03 (2026-10-13)

- `GET /api/listings` `neighborhood` filter: PostgREST maps `*` in `ilike` values to `%`, so `Gran*` acts as a wildcard rather than an exact match. Low severity; verify against a live PostgREST, then substitute or reject `*`.
