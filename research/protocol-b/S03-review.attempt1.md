## RAISED
Blind Hunter | medium | src/lib/listings.ts:425 | `select("*, images:listing_images(*)")` returns every column, so future internal fields could leak, and `data` has no real type.
Blind Hunter | medium | src/lib/listings.ts:427-440 | The past-the-end fallback runs a second count query. Nothing tests that it applies the same filters, and `new Date()` is evaluated twice, so `total` can disagree with the page.
Blind Hunter | low | src/lib/listings.ts:416 | `ilike` "exact match" for neighborhood is still affected by accents and whitespace, and the matching rule isn't pinned in the contract.
Blind Hunter | low | src/lib/listings-query.ts:254-256 | The integer parser rejects decimals such as `1000.50`, and repeated params silently use the first value.
Blind Hunter | low | src/lib/listings-query.ts:282-284 | The `min_price > max_price` error is attached to `min_price` only, and bedrooms/bathrooms have no upper bound.
Blind Hunter | medium | src/lib/supabase-public.ts:465 | A missing env var throws inside the handler and surfaces as a generic 500 "Failed to load listings". `createPublicClient` has no test.
Blind Hunter | low | src/app/api/listings/route.ts:n/a | `force-dynamic`, no `Cache-Control` header and no rate limiting on a public `count: "exact"` endpoint, with no follow-up story recorded.
Blind Hunter | medium | src/lib/listings.test.ts:n/a | Tests use a permissive fake client and no integration test hits real PostgREST. The `ilike` escape is untested for backslash, `total_pages` is untested for total 0, and null/empty images are untested.
Blind Hunter | low | spec-1-3-s03:n/a | The spec says `status: done` while `sprint-status.yaml` says `review`.
Blind Hunter | low | spec-1-3-s03:n/a | The spec has no acceptance criteria, and the 400/500 response shapes aren't documented as an API contract. It also lists "map" as a consumer but defines no coordinate filter.
Edge Case Hunter | medium | src/lib/listings-query.ts:276-277 | `bedrooms`/`bathrooms` above 32767 pass validation and cause a Postgres smallint out-of-range error, which returns 500 instead of 400.
Edge Case Hunter | medium | src/lib/listings.ts:416 | `escapeLike` doesn't escape `*`, which PostgREST `ilike` treats as a wildcard, so `neighborhood=*` matches every row.
Edge Case Hunter | low | src/lib/listings-query.ts:280 | `neighborhood` has no length cap, so an oversized value produces an upstream URL error that surfaces as 500.
Edge Case Hunter | low | src/lib/listings.ts:433-443 | A null `count` falls back to `count ?? 0`, so non-empty data can come back with `total` 0.
Edge Case Hunter | low | src/lib/listings.ts:436-443 | Rows inserted between the range query and the fallback count can leave an empty page with a nonzero total.
Edge Case Hunter | low | src/lib/listings-query.ts:242-245 | Repeated params such as `page=1&page=2` are accepted and the later value is ignored.
Verification Gap | medium | src/lib/listings.ts:425 | The embed select string, `count: "exact"`, and the fallback's `head`/filter calls are never asserted, so the response contract can break with tests still green.
Verification Gap | low | src/lib/listings.test.ts:325 | The `published_at` `lte` test checks the column name only, not the timestamp value.
Verification Gap | low | src/lib/supabase-public.ts:n/a | `createPublicClient` is untested, and the route test mocks it away.
Verification Gap | low | src/lib/listings-query.test.ts:n/a | No positive boundary tests for `limit=50` or `page=100000`.
Acceptance Auditor | low | src/lib/listings.ts:n/a | The published-only rule (`published_at IS NOT NULL AND <= now()`) is an undocumented decision in the spec.
Acceptance Auditor | low | src/lib/listings-query.ts:282-284 | The cross-field price error is attributed to one field only, which satisfies "per-field errors" only loosely.
Acceptance Auditor | low | src/lib/listings.ts:n/a | A page past the end returns 200 with empty data. The spec is silent on this.
Acceptance Auditor | low | spec-1-3-s03:n/a | The spec's file list omits `src/lib/listings.ts`, which the diff adds.
Acceptance Auditor | low | src/lib/listings.ts:n/a | Image ordering by `position` relies on S02's `orderImages`, which isn't in the diff, so the requirement can't be verified from the diff alone.
Acceptance Auditor | low | spec-1-3-s03:n/a | The triage-log claims (`price_cop` not null, RLS makes all columns public) can't be verified from the diff.
Acceptance Auditor | low | spec-1-3-s03:n/a | The spec says `status: done` while `sprint-status.yaml` says `review`.

## TRIAGE
1. defer — all columns are public today (the S03 triage log reached the same conclusion). Revisit when internal fields are added.
2. patch — add assertions that the fallback head query reuses the same filters. This is the same gap as raised finding 17.
3. reject — case-insensitive matching meets the spec. Accent and whitespace handling is a product decision, not a defect.
4. reject — integer-only is intentional for the spec'd fields. Repeated params are covered by 15.
5. patch — also flag `max_price` in the cross-field error. This is a trivial change and also resolves 22.
6. defer — a config error returning a generic 500 is acceptable. A test for `createPublicClient` is covered by 19.
7. defer — caching and rate limiting are hardening work. Record a follow-up story.
8. defer — the integration test needs infrastructure. Cheap unit gaps are covered by 17, 18 and 20.
9. reject — this is a process artifact, not code (see 27).
10. reject — the spec has no acceptance criteria and no coordinate filter, and the API contract is out of scope for the code. The spec is frozen.
11. patch — add a max cap (32767) for bedrooms/bathrooms, so oversized values return 400 instead of 500.
12. patch — escape `*` in `escapeLike`, so `neighborhood=*` doesn't match every row.
13. patch — add a small length cap on neighborhood, for example 100 characters.
14. defer — a null count is unlikely with `count: "exact"`. Revisit if it is observed.
15. reject — a race between two queries is inherent to offset pagination and is benign.
16. defer — repeated params are an edge case, and the first value winning is acceptable. This duplicates 4.
17. patch — add assertions on the select string, `count` option, and fallback filters in `listings.test.ts`.
18. defer — RLS backstops the filter. Low value.
19. defer — the env-var path is low risk.
20. patch — add boundary tests for `limit=50` and `page=100000`. This is cheap.
21. reject — the published rule is consistent with the spec's intent.
22. patch — same fix as 5.
23. reject — page-past-end returning 200 with empty data is the standard behavior, and the spec is silent.
24. reject — the omission from the spec's file list is harmless.
25. reject — `orderImages` exists from S02 and is unit-tested there.
26. reject — the claims are outside the diff and consistent with the schema.
27. reject — a process artifact, not a code finding. The status flag is updated by the workflow.

FINDINGS_TOTAL: 27