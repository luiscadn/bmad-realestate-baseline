---
title: 'S02 - listing-images storage bucket, policies, and image upload/ordering helpers'
type: 'feature'
created: '2026-10-13'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
baseline_commit: '5a919a34c80b042fc13c6b1fdf54200e3a3adbb5'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Listings need photo galleries, but there is no storage bucket, no storage policies, and no code to upload images or keep their order.

**Approach:** Add a migration creating the public-read `listing-images` bucket with storage RLS (authenticated agents upload/update/delete only under a folder named after a listing they own), and a typed service in `src/lib/listing-images.ts` that uploads files, inserts `listing_images` rows with the next `position`, and reorders/deletes them. `listing_images.position` (from S01) is the sort column.

</frozen-after-approval>

## Implementation Notes

- Files: `supabase/migrations/20261013000100_storage_listing_images.sql`, `src/lib/listing-images.ts`, `src/lib/listing-images.test.ts`.
- Object path convention: `{listing_id}/{uuid}.{ext}`; policies check `(storage.foldername(name))[1]` against `listings.agent_id = auth.uid()`.
- Reorder is a pure helper (`orderImages`, `moveImage`) plus a persisting `reorderListingImages` that writes dense positions 0..n-1.
- Verified on local Supabase after `supabase db reset` (REST/Storage API as demo agent): bucket public, 10 MB / image mime limits; owner upload 200; upload to another listing's folder 403; anon upload 403; anon public GET 200; anon delete 403; owner delete 200; non-image mime 415.
- `npx vitest run`, `tsc --noEmit`, `next build` pass. Persisting functions (`uploadListingImage`, `reorderListingImages`, `deleteListingImage`) are not unit-tested against a live DB; covered only by the API checks above.
- Review subagents were not launched (not requested in this session); no review triage recorded.

### Review Findings

- [ ] [Review][Decision] Position writes are not atomic — concurrent `uploadListingImage` calls compute the same `nextPosition`, and `reorderListingImages` does N sequential UPDATEs, so a mid-loop failure leaves duplicate/partial positions (reads stay stable via created_at/id tie-break). Options: (a) accept as-is, (b) add a Postgres RPC that reorders/inserts in one transaction, (c) add a unique `(listing_id, position)` constraint (deferrable) plus retry. [listing-images.ts:uploadListingImage, reorderListingImages]
- [ ] [Review][Decision] Storage SELECT policy exposes every object to `anon` via the list API, including images of unpublished (draft) listings that the `listing_images` RLS deliberately hides. Public GET by URL works without this policy on a public bucket. Options: (a) keep (matches "public-read"), (b) restrict anon select to objects whose listing is published, keeping owner select for upload/upsert. [20261013000100_storage_listing_images.sql:17-20]
- [x] [Review][Patch] `pathFromPublicUrl` kept `?query`/`#hash` and threw on malformed percent-encoding, so a cache-busted URL would fail to delete the storage object [listing-images.ts:pathFromPublicUrl]
- [x] [Review][Patch] `reorderListingImages` update and `deleteListingImage` delete ignored zero-row results (RLS filters silently), reporting success; update now also scoped by `listing_id` [listing-images.ts]
- [x] [Review][Patch] `deleteListingImage` swallowed storage `remove` errors, leaving orphaned objects silently; now surfaced after the gap is closed [listing-images.ts:deleteListingImage]
- [x] [Review][Patch] Persisting functions had no tests; added guard tests (orderedIds mismatch, zero-row delete) and URL edge cases [listing-images.test.ts]
- [x] [Review][Defer] Deleting a listing cascades `listing_images` rows but leaves storage objects orphaned — deferred: needs a cleanup job/trigger, outside S02 scope
- [x] [Review][Defer] No per-listing image count cap — deferred: not in the S02 spec; raise in a later story

#### Rejected
- Redundant index `listing_images_listing_position_created_idx` (S01 already has `(listing_id, position)`): low, harmless, deleting it is not worth a new migration; it does cover the `created_at` tie-break order.
- `buildImagePath` does not validate `listingId` format: low, caller-controlled and storage RLS fails closed on non-owned folders.
- Client-supplied `file.type` is spoofable: false, the bucket's `allowed_mime_types` enforces it server-side (spec notes 415 verified).
- Non-idempotent `create policy` statements: low, migrations run once.
