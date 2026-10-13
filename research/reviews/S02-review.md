**Code review complete.** 2 `decision-needed`, 4 `patch`, 2 `defer`, 4 rejected. I applied the 4 patches, and `vitest` (10 tests) and `tsc --noEmit` pass. The 2 decisions still need your call, so the story status stays `review`.

I ran the review layers inline rather than as subagents, since you didn't ask for them. Findings are in the spec file under `### Review Findings`, and the two defers are in `deferred-work.md`.

**Decisions for you**
1. **Position writes aren't atomic.** Two concurrent uploads compute the same `nextPosition`. `reorderListingImages` runs N separate UPDATEs, so a failure partway leaves partial positions. Reads still sort stably because of the `created_at`/`id` tie-break. Options:
   - (a) Accept it as is.
   - (b) Add a Postgres function that reorders in one transaction.
   - (c) Add a deferrable unique `(listing_id, position)` constraint plus a retry.
2. **The anon SELECT policy on `storage.objects` lets anyone list every object.** That includes images of unpublished drafts, which the `listing_images` RLS hides. A public bucket serves files by URL without this policy. Options:
   - (a) Keep it, which matches "public-read".
   - (b) Limit anon select to objects whose listing is published, and keep owner select for uploads.

**Patches applied** (`src/lib/listing-images.ts` and its test)
- **`pathFromPublicUrl`:** It kept `?query` and `#hash`, and threw on bad percent-encoding. So a cache-busted URL would have failed to delete the storage object. It now strips them and returns `null` on bad input.
- **Zero-row writes:** RLS filters rows silently, so reorder and delete reported success when they changed nothing. Both now check the returned rows and throw when there are none. The reorder update is also scoped to `listing_id`.
- **Storage removal errors:** `deleteListingImage` swallowed them. It now throws after the position gap is closed.
- **Tests:** I added tests for mismatched `orderedIds`, a zero-row delete, and URL edge cases.

**Deferred**
- Deleting a listing cascades its `listing_images` rows but leaves the storage objects behind.
- There is no cap on images per listing.

**Rejected**
- The extra index duplicates the S01 prefix index, but it's harmless.
- `buildImagePath` doesn't validate the listing id, but storage RLS blocks any folder the user doesn't own.
- A client-spoofed `file.type` is blocked by the bucket's `allowed_mime_types`.
- The `create policy` statements aren't idempotent, but migrations only run once.

The storage RLS policies themselves look correct. The migration is untested here, and the upload, reorder and delete paths are only covered by the guard tests plus the earlier manual API checks in the spec.

Once you've decided on the two items, I can apply the chosen fix and move the story to `done`.
