Still working: all four review layers have reported, and I'm now compiling and triaging their findings. I haven't edited any repo files. I wrote only the diff and claims files in a temp directory, as the skill's step 1 requires.

## RAISED

blind-hunter | n/a | src/lib/listings.ts:72 | `agent:agents(*)` exposes every agents column (including any internal or future ones) on a public route.
blind-hunter | n/a | src/app/api/listings/[slug]/route.ts:10 | No slug format or length validation. The "slug injection" item in the spec's triage log is asserted without evidence.
blind-hunter | n/a | src/app/api/listings/[slug]/route.test.ts:3 | Route tests mock both the helper and the client, so the real wiring is never exercised.
blind-hunter | n/a | src/lib/listing-by-slug.test.ts:5 | Helper tests are brittle because they assert the exact select string and call order against a hand-rolled fake builder.
blind-hunter | n/a | src/lib/listing-by-slug.test.ts:25 | The `lte` assertion checks only the column name, not that the value is "now", and no fake-timer test covers a future-dated row.
blind-hunter | n/a | src/lib/listing-by-slug.test.ts:n/a | No test for slugs that need URL-encoding or contain special characters.
blind-hunter | n/a | src/lib/listings.ts:68 | The return type `Record<string, unknown> | null` loses type safety and forces casts in the tests.
blind-hunter | n/a | src/lib/listing-by-slug.test.ts:n/a | `orderImages` behaviour for equal or null `position` is untested.
blind-hunter | n/a | src/app/api/listings/[slug]/route.ts:5 | `force-dynamic` with no Cache-Control or revalidation means every detail request hits the DB.
blind-hunter | n/a | src/lib/listings.ts:79 | Behaviour when `agent` is null (deleted or hidden by RLS) is untested and undocumented.
blind-hunter | n/a | src/lib/listings.ts:76 | A `maybeSingle()` error from duplicate rows surfaces as a 500.
blind-hunter | n/a | src/app/api/listings/[slug]/route.test.ts:37 | No test that the 500 response omits the DB error message.
blind-hunter | n/a | _bmad-output/implementation-artifacts/spec-1-4-s04-get-api-listings-slug.md:5 | Spec says `status: done` while sprint-status says `review`.
blind-hunter | n/a | _bmad-output/implementation-artifacts/spec-1-4-s04-get-api-listings-slug.md:28 | The spec's triage log comes from a non-independent inline self-review, and its "false"/"rejected" labels are unverified.
blind-hunter | n/a | _bmad-output/implementation-artifacts/sprint-status.yaml:32 | `last_updated` was hand-edited rather than generated.
edge-case-hunter | n/a | src/lib/listings.ts:69-79 | If the agent embed is null, the route returns 200 with `agent: null`, which the detail page may crash on.
edge-case-hunter | n/a | src/lib/listings.ts:79 | Null or duplicate `position` values may give unstable image order and are untested.
edge-case-hunter | n/a | src/app/api/listings/[slug]/route.ts:9 | A slug differing only by case or whitespace returns 404.
edge-case-hunter | n/a | src/app/api/listings/[slug]/route.ts:13 | No Cache-Control header, so a CDN or browser may serve a stale listing after it is unpublished.
edge-case-hunter | n/a | src/lib/listings.ts:74-75 | `new Date()` on the app server can differ from DB time, so a listing near its publish time may briefly 404 or still show.
verification-gap | n/a | src/lib/listing-by-slug.test.ts:25 | The `lte` cutoff value is never asserted. Changing it to a far-future date still passes every test, so scheduled listings could leak.
verification-gap | n/a | src/lib/listing-by-slug.test.ts:22 | The select string and embed are checked only as literal text against a fake client, with no check that PostgREST resolves them.
verification-gap | n/a | src/lib/listings.ts:68 | The loose return type forces casts in tests and gives the detail page no typed contract.
acceptance-auditor | n/a | src/lib/listings.ts:79 | The spec's `orderImages` requirement is verified only through the helper test with a fake client.
acceptance-auditor | n/a | src/lib/listing-by-slug.test.ts:25 | "Unpublished returns 404" is tested only with a mocked null, and the "<= now" value is untested.
acceptance-auditor | n/a | _bmad-output/implementation-artifacts/spec-1-4-s04-get-api-listings-slug.md:5 | Spec `status: done` is inconsistent with the sprint-status `review` state.

## TRIAGE

1. reject: the spec says "agent info" and the triage log accepts the public agent embed. Agents are public-readable by RLS, and no harm from a specific column is shown.
2. reject: `.eq()` parameterizes the value, and the DB check constrains the slug format. A bad slug just returns 404, which is correct.
3. reject: this is the same mock style as S03. The route's job is thin, and the helper has its own tests.
4. reject: this matches the S03 fake-builder convention. It is a style preference with no named harm.
5. patch: assert the `lte` value with fake timers (same root cause as finding 21).
6. reject: `.eq()` handles encoding, and Next decodes the param.
7. defer: a typed `Listing` return is a design change. S03 uses the same loose shape, so it belongs in a shared typing pass.
8. reject: this tests `orderImages`, which is existing S03 code with its own tests. It is not part of this diff.
9. reject: `force-dynamic` and no caching mirror S03 and the spec ("mirror the S03 route"). It is a design choice.
10. defer: a null agent is a real contract question for the detail page (S-later). It is not a defect in this diff, since the agent FK is likely NOT NULL.
11. reject: the slug is unique, so duplicate rows cannot occur. Returning 500 on a DB error is correct.
12. reject: the route returns a fixed message, which the 500 test already asserts with `toEqual`.
13. reject: a spec status of "done" is the dev workflow's own convention, and the fix would be to edit the spec under review.
14. reject: this is process commentary, and the fix would be to edit the spec.
15. reject: the file is a tracking artifact with no behavioural harm.
16. defer: same as finding 10.
17. reject: same as finding 8.
18. reject: case-folding slugs is speculative, and the DB check constrains the slug format.
19. reject: same as finding 9. Without a cache header, Next dynamic routes aren't cached anyway.
20. reject: the code deliberately mirrors S03's `lte(now)`, and RLS enforces the same rule. A few seconds of skew is negligible.
21. patch: add a fake-timer test that asserts `["lte","published_at", <frozen ISO>]`. This is the one verified gap. Merged with findings 5 and 25, and it routes to a test-only patch.
22. reject: the same fake-client approach is used in S03, and a real-DB test is out of scope for this story.
23. defer: same as finding 7.
24. reject: the helper test does assert the resulting image order, which covers the requirement.
25. patch: duplicate of finding 21, so the same patch fixes it.
26. reject: same as finding 13.

FINDINGS_TOTAL: 26