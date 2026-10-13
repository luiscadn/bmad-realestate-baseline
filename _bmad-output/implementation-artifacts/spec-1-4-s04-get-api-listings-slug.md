---
title: 'S04 - GET /api/listings/[slug]'
type: 'feature'
created: '2026-10-13'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** There is no endpoint to fetch one published listing by its unique slug for the property detail page.

**Approach:** Add `GET /api/listings/[slug]` (Next.js 15 App Router; `params` is a Promise) backed by a `fetchListingBySlug` helper in `src/lib/listings.ts`. It selects the listing with `images:listing_images(*)` ordered via `orderImages` and `agent:agents(*)`, restricted to published rows (`published_at` not null and <= now, same rule as S03). Returns `200 { data: listing }`, `404 { error }` when absent or unpublished, `500` on query failure. Vitest tests cover the route and the helper.

</frozen-after-approval>

## Implementation Notes

- Reuse `createPublicClient` and `orderImages`; mirror the S03 route's error handling and `force-dynamic`.
- `maybeSingle()` so a missing row yields null (404), not an error.

## Review Triage Log

Inline self-review (no subagent launched; not explicitly requested).
- false: slug injection — `.eq()` URL-encodes the value; the DB check constrains slug format anyway.
- low (rejected): agent embed returns email/phone — intended; agents are public-readable by RLS and the story requires agent info.
- low (rejected): `lte(now)` is also enforced by RLS; kept explicit for parity with S03 and so authenticated agents' unpublished drafts never leak through this public route.
