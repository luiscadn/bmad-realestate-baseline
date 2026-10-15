## RAISED

Line numbers are the best match to the file, and `n/a` where a finding has no single line.

1. Blind Hunter | medium | src/lib/leads.ts:n/a | `name`, `message` and `phone` have no length caps, so the public endpoint accepts arbitrarily large values.
2. Blind Hunter | low | src/lib/leads.ts:13 | The email regex accepts malformed addresses such as `a@b..c`, `a@.com` and `a@b.`.
3. Blind Hunter | low | src/app/api/leads/route.ts:n/a | An unknown or unpublished `listing_id` (FK/RLS rejection) returns 500 instead of 4xx, and the test pins `23503` to 500.
4. Blind Hunter | low | src/app/api/leads/route.ts:n/a | There is no rate limiting, honeypot, captcha or body-size limit, and no follow-up item records the gap.
5. Blind Hunter | low | src/app/api/leads/route.test.ts:27 | The "normalized lead" route test only exercises name trimming, not email or message trimming or inner phone spaces.
6. Blind Hunter | low | src/lib/leads.test.ts:n/a | Several cases are untested: empty-string `listing_id` or `phone`, email over 254 characters, array or primitive body at the route level, and wrong content-type.
7. Blind Hunter | low | src/app/api/leads/route.ts:13 | A JSON-parse failure puts `body` into the `errors` map, which is otherwise keyed by field name.
8. Blind Hunter | low | src/lib/leads.ts:1 | The hand-written `LeadInput` type is not derived from the Supabase schema and can drift silently.
9. Blind Hunter | low | src/app/api/leads/route.test.ts:n/a | All route tests mock the client, so the anon-insert-without-`.select()` and RLS assumption is never verified against a real database.
10. Blind Hunter | low | src/app/api/leads/route.ts:23 | The 201 response `{ data: { received: true } }` returns no lead id or Location, and the envelope is undocumented.
11. Blind Hunter | low | _bmad-output/implementation-artifacts/spec-1-5-s05-post-api-leads-contact-the-agent-form.md:n/a | Process inconsistencies: spec `status: done` vs sprint `review`, the decisions-log timestamp (13:05) is earlier than the sprint-status update (15:30), implementation detail sits in the frozen block, and the self-review had no independent reviewer.
12. Blind Hunter | low | src/app/api/leads/route.ts:5 | No explicit Content-Type check, CORS or OPTIONS handling, and `force-dynamic` is redundant on a POST handler.
13. Blind Hunter | low | src/app/api/leads/route.ts:27 | `console.error` logs the full Supabase error object, which can contain row details with the visitor's PII.
14. Edge Case Hunter | medium | src/lib/leads.ts:n/a | `name`, `message` and `phone` have no maximum length, so anonymous callers can insert very large rows.
15. Edge Case Hunter | low | src/app/api/leads/route.ts:10 | `request.json()` buffers the whole body with no size limit.
16. Edge Case Hunter | low | src/lib/leads.ts:13 | The email regex lets `a@b..c`, `a@.b.c` and `a@b.` through.
17. Edge Case Hunter | low | src/lib/leads.ts:38 | A blank or whitespace-only `listing_id` is silently stored as null instead of being rejected.
18. Edge Case Hunter | low | src/app/api/leads/route.ts:25 | All DB errors map to 500, so a client-caused FK or constraint error looks like an outage.
19. Edge Case Hunter | low | src/app/api/leads/route.ts:n/a | There is no rate limit or duplicate-submission guard on the unauthenticated insert.
20. Verification Gap | medium | src/lib/leads.test.ts:n/a | The 254-character email cap in `validateLead` is not pinned by any test, so removing it would pass every existing test.
21. Verification Gap | medium | src/lib/leads.test.ts:n/a | Normalization of empty or whitespace `phone` and `listing_id` to null is not tested, and dropping `|| null` would pass every existing test.
22. Verification Gap | low | src/lib/leads.ts:36 | The `message` requirement differs from the nullable `leads.message` column (the reviewer itself noted this matches the spec).
23. Verification Gap | low | src/lib/leads.ts:n/a | `name`, `message` and `phone` are uncapped (the reviewer noted this duplicates the length-cap finding).
24. Acceptance Auditor | low | src/app/api/leads/route.ts:23 | The 201 body `{ data: { received: true } }` is not defined in the spec.
25. Acceptance Auditor | low | src/app/api/leads/route.test.ts:n/a | There is no route-level test for an invalid `listing_id` or `phone`; only the helper tests cover them.
26. Acceptance Auditor | low | src/lib/leads.ts:35 | The 254-character email limit goes beyond what the spec says.
27. Acceptance Auditor | low | src/lib/leads.ts:38 | Whitespace-only `listing_id` and `phone` are treated as null rather than rejected, and the spec is silent on this.

## TRIAGE

1. decision-needed: caps are worth adding to a public insert, but the limit values are a product choice and the spec is silent. Merges with 14, 23.
2. reject: the DB check is only `@` position and a precise regex adds complexity for low-impact bad emails.
3. reject: the spec explicitly maps all DB errors to 500.
4. reject: the spec's triage already scoped abuse protection out of S05.
5. reject: the route test does cover name trimming through the route, and the helper tests cover trimming of the other fields.
6. patch: add the missing tests. Overlaps 20 and 21.
7. reject: the spec itself defines `errors` for invalid JSON, and this is a design nit.
8. reject: there are no generated types in the repo, so there is no named harm.
9. defer: a real-DB test is a separate integration-test effort, and the unverified RLS assumption is worth a later check.
10. reject: anon cannot select, so returning an id is not possible without extra policy, and the spec leaves the body open.
11. reject: the finding's only fix is to edit the spec, and the status mismatch is a workflow artifact.
12. reject: speculative hardening with no demonstrated harm, and the redundant `force-dynamic` is cosmetic.
13. patch: log only `code` and `message`, a direct correction. Postgres check-violation details can echo the failing row, which holds PII.
14. decision-needed: duplicate of 1 (merge into one entry).
15. defer: body size is best limited at the platform or infrastructure level, so it is not actionable in this story.
16. reject: duplicate of 2.
17. reject: coercing blank optional fields to null is intended and form-friendly, and 21 will pin that behavior.
18. reject: duplicate of 3, and the spec explicitly maps all DB errors to 500.
19. reject: duplicate of 4, and out of scope.
20. patch: add a test for an email over 254 characters, optionally with an exactly-254 case that is accepted.
21. patch: add a test that `""` and whitespace for `phone` and `listing_id` normalize to null.
22. reject: false. This matches the spec ("message non-blank").
23. decision-needed: duplicate of 1 (merge).
24. reject: the spec leaves the body unspecified and the implementation is compatible with it.
25. reject: those cases take the same 400 path, and the helper tests cover them. Item 6 covers any route-level addition.
26. reject: the cap is harmless and consistent with "valid format". Item 20 pins it.
27. reject: the spec is silent and the behavior is intended.

FINDINGS_TOTAL: 27