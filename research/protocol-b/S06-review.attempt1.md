## RAISED

blind-hunter | medium | src/app/api/agent/listings/[id]/route.ts:258 | PATCH `published:true` on an already-published listing resets `published_at`, which reorders the public newest feed.
blind-hunter | medium | src/app/api/agent/listings/route.ts:n/a | Cookie-authenticated mutations have no CSRF defense: `request.json()` does not enforce Content-Type or Origin.
blind-hunter | medium | src/lib/agent-auth.ts:n/a | `getAgent` accepts any valid Supabase user with no agent-row check, so a non-agent gets inconsistent responses (403 on POST, empty list on GET, 404 on PATCH and DELETE).
blind-hunter | low | src/app/api/agent/listings/route.ts:n/a | The random 6-character auto-generated slug can collide and return a confusing 409 with no retry.
blind-hunter | medium | src/app/api/agent/listings/route.test.ts:n/a | All tests mock the Supabase client, so RLS ownership enforcement is never verified, and `deferred-work.md` does not record this gap for S06.
blind-hunter | low | src/lib/agent-listings.ts:n/a | Validation gaps: description is length-checked before trimming, there is no price cap, `open_house_at` accepts non-ISO strings and past dates, `city` cannot be null, and latitude and longitude can be set independently.
blind-hunter | low | src/app/api/agent/listings/route.ts:n/a | GET has no status/published filtering and silently ignores unknown query parameters.
blind-hunter | low | src/app/api/agent/listings/[id]/route.ts:n/a | There is no write path for `listing_images`, and DELETE cascade behavior is unverified.
blind-hunter | low | src/lib/agent-route.ts:n/a | There is no rate limit or body-size cap, error response shapes are inconsistent, and there is no API documentation.
blind-hunter | low | src/lib/agent-auth.ts:n/a | The finding questions whether the `@supabase/ssr` dependency was added (the diff shows no `package.json` change).
blind-hunter | low | _bmad-output/implementation-artifacts/sprint-status.yaml:n/a | Bookkeeping is inconsistent: the spec says `done`, sprint-status says `review`, and the self-review used no subagent. Two "rejected" items belong in deferred work.
edge-case-hunter | medium | src/lib/agent-listings.ts:~152 | `area_m2` with more than 2 decimals near the cap rounds past `numeric(10,2)`, so the DB error 22003 surfaces as a 500 instead of a 400.
edge-case-hunter | medium | src/app/api/agent/listings/[id]/route.ts:258 | PATCH `published:true` on an already-published listing resets `published_at`.
edge-case-hunter | n/a | src/app/api/agent/listings/[id]/route.ts:258 | PATCH on another agent's listing: the reviewer found no gap, because the `agent_id` filter and RLS return 404.
edge-case-hunter | low | src/lib/agent-listings.ts:~120 | `description` length is checked on the untrimmed string.
edge-case-hunter | low | src/lib/agent-listings.ts:166-170 | `open_house_at` accepts non-ISO strings via `Date.parse`, and an out-of-range year can make `toISOString` throw a RangeError, giving a 500.
edge-case-hunter | low | src/lib/agent-auth.ts:~30 | A non-Bearer Authorization scheme returns 401 even when a valid session cookie is present.
edge-case-hunter | medium | src/lib/agent-auth.ts:39 | An auth-server outage during `getUser(token)` is reported as 401, so clients discard valid tokens.
edge-case-hunter | low | src/app/api/agent/listings/route.ts:~468 | An out-of-range page returns PGRST103 with a null count, so the response reports `total: 0`.
edge-case-hunter | low | src/app/api/agent/listings/route.ts:~501 | The auto-slug collision returns 409 for a slug the client never supplied.
edge-case-hunter | low | src/app/api/agent/listings/[id]/route.ts:~278 | DELETE leaves `listing_images` storage objects orphaned and sets the leads foreign key to null.
edge-case-hunter | low | src/app/api/agent/listings/[id]/route.ts:~251 | The request body is parsed with no size cap before validation.
edge-case-hunter | n/a | src/lib/agent-listings.ts:~900 | The `__proto__` key lookup: the reviewer concluded it is practically unreachable and not a defect.
edge-case-hunter | low | src/lib/agent-listings.ts:~959 | `slug:null` returns a 400 whose message does not mention null.
edge-case-hunter | low | src/app/api/agent/listings/route.ts:~453 | A blank `page` or `limit` query value is silently treated as the default instead of returning 400.
edge-case-hunter | low | src/app/api/agent/listings/route.test.ts:n/a | The missing-env 500 path is covered only by a mocked rejection, not through the real env path.
verification-gap | medium | src/app/api/agent/listings/route.test.ts:346-378 | No test asserts the `order` or `select` arguments (images embed), so removing them leaves the suite green.
verification-gap | low | src/app/api/agent/listings/[id]/route.test.ts:155-161 | The publish tests only check that `published_at` parses as a date, not that it equals now.
verification-gap | medium | src/app/api/agent/listings/route.test.ts:n/a | No test exercises real RLS or the real 23505/23503 errors; the deferred note covers only the `published_at` reset.
verification-gap | medium | src/app/api/agent/listings/[id]/route.ts:258 | Re-publishing resets `published_at` (already recorded as deferred).
verification-gap | low | src/lib/agent-listings.ts:166 | `open_house_at` accepts non-ISO strings such as "1".
acceptance-auditor | low | src/app/api/agent/listings/[id]/route.ts:258 | Re-publishing resets `published_at`, which the spec's own triage log accepts as a known low-severity item.
acceptance-auditor | low | src/lib/agent-auth.ts:35-43 | A malformed or invalid Bearer header never falls back to the cookie, which the spec does not state. The reviewer called this arguably safer.
acceptance-auditor | low | src/lib/agent-auth.ts:n/a | The spec names the helper `requireAgent`, but the code exports `getAgent` and `authenticate`.
acceptance-auditor | low | src/app/api/agent/listings/[id]/route.test.ts:n/a | The `[id]` routes have no test for the auth layer throwing a 500, so "every route path" has small gaps.
acceptance-auditor | low | src/app/api/agent/listings/route.ts:n/a | An RLS insert violation could surface as 42501 and return 500 rather than 403, and no test covers it.

## TRIAGE

1. defer | Real, but the spec's triage log and `deferred-work.md` already record it; fixing it needs a read-before-write or DB-side coalesce.
2. defer | Real but speculative: SameSite=Lax blocks cross-site POSTs, and the spec rejected CSRF protection. A Content-Type check would be a policy decision.
3. defer | Not a real defect here: the FK and RLS block non-agents, and an `agents` row check is new behavior outside the spec.
4. reject | The collision is negligible (36^6 suffixes), and a 409 is retryable. The fix would add complexity.
5. defer | Real gap, but the pattern is shared with S05 and needs a local-Supabase integration test. It should be added to `deferred-work.md`.
6. reject | Minor choices not required by the spec. `open_house_at` is covered in finding 17 and the others are cosmetic.
7. reject | Not in spec scope, and ignoring unknown query parameters is normal.
8. reject | Image management is outside S06 scope, and the DB cascades.
9. reject | Rate limits, body caps and documentation are out of scope for this story.
10. false | `@supabase/ssr` is in `package.json:15`.
11. reject | Process bookkeeping, and the fix would be to edit the spec or status files.
12. patch | A real 500 where input validation should return 400, and the fix is a one-line rounding guard.
13. defer | A duplicate of finding 1.
14. reject | The reviewer found no defect: the `agent_id` filter and RLS give a 404.
15. reject | Trimmed-length versus raw-length is cosmetic and arguably safer.
16. patch | A non-ISO string is accepted despite the error message, and out-of-range years can cause an unhandled 500. An ISO regex plus try/catch is an unambiguous fix.
17. reject | A non-Bearer scheme returning 401 is an acceptable design, and a fallback would add branches.
18. patch | An auth outage reported as 401 is misleading to clients. The fix is to throw when the error status is 500 or higher, so `authenticate` returns 500.
19. reject | Out-of-range paging is an edge case. A total of 0 is a harmless cosmetic inaccuracy, and the fix would add a count query.
20. reject | A duplicate of finding 4.
21. defer | Real, but storage cleanup is image-management scope, which is not in S06.
22. reject | A duplicate of finding 9.
23. reject | The reviewer concluded it is not a defect.
24. reject | Cosmetic error wording.
25. reject | A blank parameter falling back to the default is harmless.
26. reject | Test-detail nit. The mocked rejection already covers the 500 mapping.
27. patch | Real test gap: stripping `order` or `select` leaves the suite green. The fix is to add `call()` assertions.
28. patch | Real test gap: a stale `published_at` would pass. The fix is fake timers and an exact assertion.
29. defer | A duplicate of finding 5; the integration test is deferred.
30. defer | A duplicate of finding 1.
31. patch | A duplicate of finding 16; it is covered by the same fix.
32. reject | Matches the spec's own triage log, which accepts it as a known low-severity item.
33. reject | The behavior is deliberate and safe, and the fix would be to edit the spec.
34. reject | Naming-only deviation with no behavioral impact; renaming would require editing the spec or code churn.
35. reject | Minor, since the auth-500 path is covered once and the `[id]` routes share the same `authenticate`.
36. reject | A speculative RLS error code with no demonstrated path. The FK check already maps to 403.

FINDINGS_TOTAL: 36