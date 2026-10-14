## RAISED

Blind Hunter | n/a | src/lib/listing-images.ts, migration | Public select policy on storage.objects lets anon list every object in the bucket, including photos of draft or unpublished listings.
Blind Hunter | n/a | n/a | RLS on the `listing_images` table is not covered here, and no test shows non-owners cannot insert, reorder or delete rows.
Blind Hunter | n/a | src/lib/listing-images.ts:90-140 | Upload, reorder and delete are not atomic and race, for example two concurrent uploads get the same position and a failed reorder leaves a half-applied order.
Blind Hunter | n/a | src/lib/listing-images.ts:105,137 | The storage `remove()` result is ignored in both the upload rollback and the delete path.
Blind Hunter | n/a | src/lib/listing-images.ts:128,134 | The reorder update has no `.eq("listing_id")` guard, and zero-row update or delete is reported as success.
Blind Hunter | n/a | src/lib/listing-images.ts:133 | `deleteListingImage` trusts the caller-supplied image object (url, listing_id) instead of fetching the row.
Blind Hunter | n/a | src/lib/listing-images.ts:66-69 | `pathFromPublicUrl` does not check host or origin, and `decodeURIComponent` can throw on malformed input.
Blind Hunter | n/a | src/lib/listing-images.ts | `validateImageFile` trusts the client-supplied `file.type` and does no magic-byte check.
Blind Hunter | n/a | src/lib/listing-images.ts:83-88 | `alt_text` has no length or content validation and there is no cap on images per listing.
Blind Hunter | n/a | src/lib/listing-images.ts:83-91 | `listingId` is never validated as a UUID.
Blind Hunter | n/a | migration:9 | The 10 MB limit is hard-coded separately in SQL and TS, so the two can drift.
Blind Hunter | n/a | src/lib/listing-images.test.ts | The persisting functions (upload, reorder, delete) have no tests, not even with a mocked client.
Blind Hunter | n/a | migration | No committed SQL or pgTAP tests for the RLS policies, so the manual 200/403/415 checks are not reproducible.
Blind Hunter | n/a | src/lib/listing-images.test.ts | Missing unit cases: orderImages tie-break, negative moveImage index, encoded pathFromPublicUrl, unsupported MIME in buildImagePath.
Blind Hunter | migration:18-66 | migration | The `create policy` statements are not idempotent, unlike the bucket upsert.
Blind Hunter | migration:24-66 | migration | The same owner `exists` subquery is repeated across three write policies.
Blind Hunter | migration:70 | migration | No supporting index on `listings(agent_id)` for the per-row policy subquery.
Blind Hunter | migration:31 | migration | `(storage.foldername(name))[1]` does not guard against nested or odd paths.
Blind Hunter | migration:36-54 | migration | The behavior of the update policy when renaming an object into another owned listing's folder is untested.
Blind Hunter | migration:2 | migration | The header comment says `{listing_id}/{filename}` but the TS uses `{uuid}.{ext}`.
Blind Hunter | n/a | spec / sprint-status.yaml | The spec says `done` while sprint-status says `review`.
Blind Hunter | n/a | spec | The spec records no code review or triage before marking the story complete.
Blind Hunter | n/a | sprint-status.yaml | The story key in sprint-status is truncated and does not match the spec filename.
Blind Hunter | n/a | spec | The spec Intent names no acceptance criteria and no non-goals.
Blind Hunter | n/a | migration | Deleting a listing cascades `listing_images` rows but leaves its storage objects.
Edge Case Hunter | src/lib/listing-images.ts:128 | n/a | A reorder update affecting zero rows (RLS or vanished id) returns no error, so success is reported falsely.
Edge Case Hunter | src/lib/listing-images.ts:126-130 | n/a | An update failing midway through the sequential loop leaves the gallery partially reordered.
Edge Case Hunter | src/lib/listing-images.ts:134 | n/a | A delete matching zero rows returns no error, then storage removal still runs.
Edge Case Hunter | src/lib/listing-images.ts:137 | n/a | The unchecked storage remove error in delete leaves orphaned files.
Edge Case Hunter | src/lib/listing-images.ts:105 | n/a | The compensating remove after a failed insert ignores its own error.
Edge Case Hunter | src/lib/listing-images.ts:139-140 | n/a | If gap-closing throws after a successful delete, the caller sees an error although the image is gone.
Edge Case Hunter | src/lib/listing-images.ts:90,101 | n/a | Two concurrent uploads read the same positions and produce duplicates.
Edge Case Hunter | src/lib/listing-images.ts:117-130 | n/a | Reorder uses a stale snapshot, so concurrent upload or reorder can collide positions.
Edge Case Hunter | src/lib/listing-images.ts:69 | n/a | Malformed percent-encoding throws URIError after the row is already deleted, and a query string or fragment in the URL is not stripped.
Edge Case Hunter | src/lib/listing-images.ts (validateImageFile) | n/a | A NaN or non-integer `file.size` passes the size checks.
Edge Case Hunter | src/lib/listing-images.ts (validateImageFile) | n/a | MIME case or parameters (`IMAGE/JPEG`, `; charset`) are rejected and fail the EXTENSIONS lookup.
Edge Case Hunter | src/lib/listing-images.ts:buildImagePath | n/a | An empty or `/`-containing listingId yields a malformed or nested path.
Edge Case Hunter | src/lib/listing-images.ts:56-62 | n/a | A NaN or fractional `toIndex` silently moves the image to index 0.
Edge Case Hunter | src/lib/listing-images.ts:46 | n/a | `created_at` is compared as a string, so mixed formats or offsets sort differently from the DB.
Edge Case Hunter | src/lib/listing-images.ts:52 | n/a | `Math.max(...spread)` can throw on huge arrays and yields NaN with a null position.
Edge Case Hunter | migration:18-66 | n/a | Non-idempotent policy creation fails on re-run.
Edge Case Hunter | migration:24-66 | n/a | Listing deletion or agent_id change leaves orphaned objects that no agent can delete.
Edge Case Hunter | migration:18-21 | n/a | The select policy exposes all bucket objects, including those of draft listings.
Edge Case Hunter | migration:31 | n/a | The policy allows nested subfolder paths like `{id}/x/y.png`.
Edge Case Hunter | spec:34 | n/a | The spec's API checks used raw REST calls, so the persisting functions were never executed.
Verification Gap | migration | n/a | Storage RLS and bucket config have no repeatable test, so a cross-tenant hole would ship with green tests.
Verification Gap | src/lib/listing-images.ts:83-141 | n/a | Position and ordering logic in upload, reorder and delete is untested, even with a stub client.
Verification Gap | src/lib/listing-images.ts:126-130 | n/a | Reorder is non-transactional and upload's position computation is read-then-insert (an "other" finding).
Verification Gap | src/lib/listing-images.ts:137 | n/a | The delete path ignores the storage `remove` error (an "other" finding).
Verification Gap | src/lib/listing-images.ts:69 | n/a | `decodeURIComponent` throws URIError instead of ListingImageError after the row is deleted (an "other" finding).
Acceptance Auditor | migration:2 | n/a | The migration comment `{filename}` conflicts with the spec's `{uuid}.{ext}` convention, a documentation drift only.
Acceptance Auditor | src/lib/listing-images.ts:134-137 | n/a | Delete removes the DB row before the storage object with no rollback, and the remove error is ignored.
Acceptance Auditor | src/lib/listing-images.ts:139-140 | n/a | Gap-closing in delete relies on the row-by-row reorder, so partial failure leaves positions not dense.
Acceptance Auditor | src/lib/listing-images.ts:90,101 | n/a | Concurrent uploads can get the same position because the index is not unique.
Acceptance Auditor | spec / sprint-status.yaml | n/a | The persisting functions are untested, and the spec says `done` while sprint-status says `review`.
Acceptance Auditor | spec | n/a | The 403/415/200 verification claims cannot be reproduced from the diff.

## TRIAGE

1. patch | Real but low impact, and the spec intends a public bucket. Patch only if the product wants a draft-photo restriction. I treat it as defer, see item 46.
2. defer | The `listing_images` table RLS was set in S01 and is outside this diff.
3. defer | Atomicity needs an RPC or transaction, a larger design change. Not patched in this story.
4. patch | Check the `remove` errors, at least in the delete path, with a direct fix.
5. patch | Scope the update with `.eq("listing_id")` and use `.select()` to detect zero rows. Low severity.
6. reject | Callers hold DB-fetched rows, and RLS limits what a bad object can do.
7. patch | Wrap `decodeURIComponent` in try/catch. This is a real throw after the row is deleted.
8. reject | The bucket's `allowed_mime_types` enforces this server-side.
9. reject | Speculative hardening with no demonstrated harm.
10. reject | The foreign key and RLS already reject invalid IDs.
11. reject | Cosmetic drift risk only.
12. patch | Add stubbed-client tests for upload, reorder and delete. This is the strongest test gap.
13. defer | Needs a Supabase integration harness the repo doesn't have yet.
14. reject | Low-value extra cases.
15. reject | Migrations run once, and the bucket upsert is already idempotent.
16. reject | Duplication is acceptable at this size.
17. reject | `listings.id` is the primary key, and no performance harm was shown.
18. reject | Duplicates item 19 below and has no demonstrated exploit.
19. reject | The `with check` clause covers it, and no harm was shown.
20. reject | Comment drift only.
21. reject | A process artifact, and fixing it means editing the spec.
22. reject | Process observation, and fixing it means editing the spec.
23. reject | Out of scope, and fixing it means editing the spec.
24. reject | Fix is to edit the spec under review.
25. defer | Storage cleanup on listing deletion is a real gap but belongs to a later story.
26. patch | Same root cause as item 5, zero-row reorder succeeds silently.
27. defer | Duplicate of item 3, needs a transaction or RPC.
28. patch | Same root cause as item 5, zero-row delete.
29. patch | Duplicate of item 4.
30. patch | Duplicate of item 4, the upload rollback.
31. defer | Needs the transactional redesign in item 3.
32. defer | Duplicate of item 3, concurrent uploads.
33. defer | Duplicate of item 3, stale snapshot.
34. patch | Duplicate of item 7.
35. reject | The bucket enforces the limit server-side.
36. reject | A strict MIME check is acceptable behavior.
37. reject | Duplicate of item 10.
38. reject | Callers are UI-driven, so this is unlikely to be hit.
39. reject | Negligible, and Postgres timestamps are uniform.
40. reject | Negligible for realistic gallery sizes.
41. reject | Duplicate of item 15.
42. defer | Duplicate of item 25.
43. reject | Duplicate of item 1, no harm was shown.
44. reject | Duplicate of item 18.
45. defer | Duplicate of item 13.
46. defer | Duplicate of item 13. (Item 1: public read of draft photos is deferred, not patched.)
47. patch | Duplicate of item 12.
48. defer | Duplicate of item 3.
49. patch | Duplicate of item 4.
50. patch | Duplicate of item 7.
51. reject | Documentation drift only.
52. patch | Duplicate of item 4.
53. defer | Duplicate of item 3.
54. defer | Duplicate of item 3.
55. reject | Duplicate of items 21 and 22, and fixing it means editing the spec.
56. defer | Duplicate of item 13.

Items 1 and 46 conflict in the row above: item 1 is a **defer** and the "patch" shown on line 1 is superseded, because a draft-photo restriction is a product decision.

FINDINGS_TOTAL: 56