Code review of S04 (`9e84c78` vs `main`) is done. Four reviewers ran: Blind Hunter, Edge Case Hunter, Verification Gap and Acceptance Auditor. I applied two patches. The 19 listing tests pass and `tsc --noEmit` is clean. Nothing is committed.

I did not stop at the BMAD checkpoints to ask you to confirm the target or pick a patch option, because your request already gave the target and told me to apply patches.

**Patched (1 finding, 2 fixes)**
- **Malformed slug returned 500.** A slug that fails the DB's slug check, such as `%00`, uppercase, or `a/b`, went straight to PostgREST. A NUL character would error there and come back as a 500 with a logged error, instead of a 404.
  - `fetchListingBySlug` in `src/lib/listings.ts` now returns `null` before querying when the slug doesn't match `^[a-z0-9]+(-[a-z0-9]+)*$`, the same pattern as the `listings.slug` constraint.
  - `src/lib/listing-by-slug.test.ts` gets seven malformed-slug cases that check for `null` and no query.
- **Weak `lte` assertion.** The test only checked that `lte` was called on `published_at`, so a wrong or stale cutoff would still pass. A new test freezes time and asserts the exact ISO timestamp.

**Rejected**
- **Agent email and phone exposed (Blind Hunter):** intended. The RLS policy "agents are publicly readable" says agents are shown on the listing detail page.
- **`select("*")` over-fetching:** every `listings` and `listing_images` column is already public data.
- **Duplicate slugs making `maybeSingle` error (Edge Case Hunter):** `slug` is `unique` in the schema.
- **`agent` possibly null:** `listings.agent_id` is `not null` with an `on delete restrict` foreign key.
- **Image order not tied-break tested:** `orderImages` already sorts by position, then `created_at`, then `id`, and has its own tests.
- **Cache headers, a typed `ListingDetail`, slug in the error log, a weak mock assertion:** low severity, and the fix would be larger than the problem. The route also follows the S03 pattern.
- **Spec status inconsistencies:** the fix would edit the spec under review.

**Deferred or decision needed:** none.

**Acceptance Auditor:** no violations against the spec.

The spec has no Tasks section, so I wrote no findings into it and no deferred-work entries. I also did not change `sprint-status.yaml`; S04 is still marked `review` there. The spec's frontmatter says `status: done`, which doesn't match.

I can commit the patches or move S04 to `done` if you want.
