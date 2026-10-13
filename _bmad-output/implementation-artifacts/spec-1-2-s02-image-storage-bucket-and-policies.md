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
