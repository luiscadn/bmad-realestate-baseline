## RAISED
blind-hunter | n/a | src/app/api/newsletter/route.ts:185 | Response bodies differ from the spec I/O matrix (201/200 return `{data:{subscribed:true}}`, 400 error strings differ), and a client can't tell new from duplicate.
blind-hunter | n/a | src/app/api/newsletter/route.ts:198 | The 201 vs 200 split reveals which emails are already subscribed (enumeration).
blind-hunter | n/a | src/lib/newsletter.ts:n/a | The server ignores consent and stores no consent timestamp, double opt-in or unsubscribe mechanism.
blind-hunter | n/a | src/app/api/newsletter/route.ts:n/a | The public anon-insert endpoint has no rate limit, captcha, honeypot or body size cap.
blind-hunter | n/a | src/lib/newsletter.ts:n/a | Validation is duplicated across the client validator, the parser and a looser SQL check, with no test that they agree.
blind-hunter | n/a | route.test.ts:n/a | There is no live or integration test of the RLS policies, and the route tests mock Supabase.
blind-hunter | n/a | supabase/migrations/20261013000300_newsletter_subscribers.sql:n/a | The `email = lower(email)` check raises 23514 for non-route inserts, which is unhandled and untested.
blind-hunter | n/a | route.ts:n/a | Other route gaps: no Content-Type check, no CORS policy, `name` is not HTML-escaped, and the migration has no down/rollback or unsubscribe/status columns.
blind-hunter | n/a | supabase/migrations/20261013000300_newsletter_subscribers.sql:21 | The select policy depends on `public.agents.id = auth.uid()`, an undocumented dependency.
blind-hunter | n/a | spec file | The spec's ACs omit the invalid-JSON, RLS read-denial and 500 cases, and `review_loop_iteration` is stale with tasks ticked before review.
edge-case-hunter | n/a | src/lib/newsletter.ts:265 | An email with NUL or control characters passes `EMAIL_RE` and then fails at Postgres, returning 500 instead of 400.
edge-case-hunter | n/a | src/app/api/newsletter/route.ts:196 | A 23514 check violation returns 500 instead of 400.
edge-case-hunter | n/a | src/app/api/newsletter/route.ts:183 | `request.json()` has no body size cap, so an unauthenticated caller can send huge payloads.
edge-case-hunter | n/a | src/app/api/newsletter/route.ts:180 | There is no rate limit, captcha or honeypot, so the endpoint can be flooded or probed via the duplicate response.
edge-case-hunter | n/a | supabase/migrations/20261013000300_newsletter_subscribers.sql:303 | The insert policy applies to anon and authenticated and relies on default grants, with no explicit grant or revoke.
edge-case-hunter | n/a | supabase/migrations/20261013000300_newsletter_subscribers.sql:309 | The migration depends on `public.agents` existing from an earlier migration.
edge-case-hunter | n/a | src/app/api/newsletter/route.ts:185 | Claim check: response shapes differ from the spec matrix.
verification-gap | n/a | supabase/migrations/20261013000300_newsletter_subscribers.sql:1 | No live or SQL-level test covers the RLS, the unique constraint or the 23505 path, so the "public select forbidden" guarantee is unverified.
verification-gap | n/a | supabase/migrations/20261013000300_newsletter_subscribers.sql:295 | The DB lowercase check is covered only by mocked insert assertions.
verification-gap | n/a | src/app/api/newsletter/route.ts:185 | Other finding: the tests pin the implemented response shapes, not the spec's.
verification-gap | n/a | NewsletterForm.tsx:n/a | Other finding: the form never sends `consent`, and the endpoint ignores it and stores nothing.
verification-gap | n/a | supabase/migrations/20261013000300_newsletter_subscribers.sql:24 | Other finding: the agents policy was not verified against the schema (`agents.id` vs `auth.uid()`).
acceptance-auditor | n/a | src/app/api/newsletter/route.ts:201 | The 201 body does not match the I/O matrix (`{ok:true,message:"Subscribed"}`).
acceptance-auditor | n/a | src/app/api/newsletter/route.ts:198 | The duplicate 200 body lacks `{ok:true,status:"already_subscribed"}`.
acceptance-auditor | n/a | src/app/api/newsletter/route.ts:190 | The 400 invalid-email body is not `{error:"Invalid email"}`.
acceptance-auditor | n/a | src/app/api/newsletter/route.ts:183 | The 400 invalid-JSON body is not `{error:"Invalid JSON"}`.
acceptance-auditor | n/a | src/app/api/newsletter/route.test.ts:n/a | The duplicate test doesn't assert `already_subscribed`.
acceptance-auditor | n/a | src/app/api/newsletter/route.ts:n/a | Weak finding: case-variant duplicates are handled via lowercasing (noted for completeness).
acceptance-auditor | n/a | src/lib/newsletter.ts:n/a | Weak finding: `name` is optional, though the spec example includes it (no real violation).
acceptance-auditor | n/a | spec file:54 | The "live test" task is ticked but the diff has no live test, and RLS requirements are untested.

## TRIAGE
1. decision-needed | The spec is frozen and shows `ok`/`message` bodies, so the code and tests deviate. Whether to change the code or renegotiate the spec is a human call (the ACs only fix status codes, which are met).
2. reject | The spec itself mandates the 201/200 split, so there is no defect, and a duplicate check always leaks existence.
3. defer | Consent storage, double opt-in and unsubscribe are outside the S13 spec and belong in a later story.
4. defer | Rate limiting and abuse controls are not in the spec, and the fix is an infrastructure-level change.
5. reject | Duplication is minor, and the SQL check is intentionally a looser backstop with no named harm.
6. patch | A task is ticked as done (live test) with no evidence, and the RLS guarantee is untested. Add a live/SQL test, or untick the task.
7. reject | The edge is covered by finding 12, which is the only inbound path, and the route lowercases.
8. reject | A grab-bag of speculative hardening with no demonstrated harm to the current change.
9. reject | `agents` exists in init_schema and its `id` follows the auth-uid pattern, so this is a true note with no defect.
10. reject | The fix is an edit to the spec under review, and the stale metadata is cosmetic.
11. patch | A NUL or control character in the email makes Postgres reject the insert and the route returns 500, so a client input error is miscategorized. Reject control characters in the parser (a direct fix).
12. patch | Mapping 23514 to 400 is a small direct correction. The route lowercases, so this is rarely reachable (low).
13. defer | Body size limits are a platform concern (Next/host limits) and the spec is silent.
14. defer | A duplicate of finding 4, so it is deferred together with it.
15. reject | Supabase defaults grant to anon/authenticated, and the insert is working as designed, so this is only speculative.
16. reject | `public.agents` is created in the earlier init_schema migration, so the ordering is fine.
17. decision-needed | A duplicate of finding 1.
18. patch | A duplicate of finding 6, and the same live/SQL test closes it.
19. reject | The lowercase check is a backstop, and the route test covers the main path.
20. reject | A duplicate of finding 1, and the shape question is decided there.
21. defer | A duplicate of finding 3 (consent is out of scope for S13).
22. reject | A duplicate of finding 9, with no defect found.
23. decision-needed | A duplicate of finding 1 (the 201 body).
24. decision-needed | A duplicate of finding 1 (the duplicate-case body).
25. decision-needed | A duplicate of finding 1 (the invalid-email message).
26. decision-needed | A duplicate of finding 1 (the invalid-JSON message).
27. patch | The test follows whatever shape finding 1 settles on, so assert the agreed duplicate body then.
28. reject | The auditor itself says the behavior is acceptable.
29. reject | The auditor itself says there is no violation.
30. patch | A duplicate of finding 6.

FINDINGS_TOTAL: 30