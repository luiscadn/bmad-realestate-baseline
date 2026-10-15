## RAISED
blind-hunter | medium | src/components/DashboardClient.tsx:32 | Out-of-order refresh responses can overwrite newer listing state when a slow request resolves after a newer one.
blind-hunter | medium | src/components/DashboardClient.tsx:50 | Mutation actions do not redirect to /login when receiving a 401 unauthorized response from an expired session.
blind-hunter | low | src/components/DashboardClient.tsx:73 | Rejections from createBrowserSupabase().auth.signOut() are unhandled and cause unhandled promise rejection warnings.
blind-hunter | medium | src/components/ListingForm.tsx:63 | Form submission treats a 401 session expiration response as a generic failure instead of redirecting to /login.
blind-hunter | low | src/components/LoginForm.tsx:34 | Login status discrimination treats 429 rate limit errors as bad credentials rather than generic failures.
blind-hunter | low | src/lib/dashboard.ts:111 | Client-side validation lacks upper bounds matching server constraints, causing oversized numbers to yield generic server errors.
blind-hunter | low | src/components/DashboardClient.tsx:13 | Dashboard query loads only the first 50 listings with no pagination controls or load-more mechanism.
blind-hunter | low | src/app/[locale]/dashboard/page.tsx:10 | Dashboard server page verifies session user but does not verify agent record existence prior to client render.
blind-hunter | low | src/components/ListingForm.tsx:128 | Cancel button discards dirty form state without a dirty-check confirmation warning.
blind-hunter | low | src/components/ListingsTable.tsx:42 | Table action buttons lack row-specific accessible names for screen reader identification.
blind-hunter | low | src/lib/dashboard.ts:47 | fromListing does not guard or normalize negative numerical values if returned from legacy records.
blind-hunter | low | src/lib/agent-auth.ts:25 | Session cookie access token is not refreshed on server component render due to no-op cookie setters.
edge-case-hunter | low | src/components/ListingForm.tsx:58 | 409 conflict handling assumes slug uniqueness conflict for any 409 response.
edge-case-hunter | low | src/components/DashboardClient.tsx:47 | Single busyId state does not guard against rapid sequential clicks on differing rows before render update.
edge-case-hunter | low | src/components/ListingForm.tsx:55 | Form submission assumes response body is valid JSON when parsing 400 responses.
edge-case-hunter | low | src/lib/dashboard.ts:98 | Area input validation allows sub-decimal float values that may exceed Postgres decimal precision.
edge-case-hunter | low | src/lib/dashboard.ts:104 | Stratum validation accepts strings with leading zeros like 01 because INT_RE and Number() coercion match.
edge-case-hunter | low | src/components/DashboardClient.tsx:64 | togglePublish uses client clock timestamp for published_at which may drift from database server time.
edge-case-hunter | low | src/components/LoginForm.tsx:28 | Password input is not trimmed allowing whitespace-only passwords to pass non-empty checks.
edge-case-hunter | low | src/components/ListingsTable.tsx:29 | Synchronous window.confirm blocks execution thread and requires test environment mocking.
edge-case-hunter | low | src/components/DashboardClient.tsx:53 | 15-second AbortSignal timeout locks row action state without a user cancel mechanism.
verification-gap | medium | src/components/DashboardClient.test.tsx:50 | No test verifies that mutation operations redirect to /login when receiving a 401 response.
verification-gap | medium | src/components/DashboardClient.test.tsx:65 | No test asserts that an error alert banner is rendered when a delete request fails.
verification-gap | low | src/components/DashboardClient.test.tsx:75 | No test verifies that router navigation to /login occurs when signOut throws an exception.
verification-gap | medium | src/components/ListingForm.test.tsx:90 | No test verifies that listing form submission redirects to /login on 401 session expiration.
verification-gap | low | src/components/LoginForm.test.tsx:40 | No test verifies that 429 rate limit and 500 server errors render generic error messages instead of bad credentials.
verification-gap | low | src/components/ListingsTable.test.tsx:35 | No test verifies that table action buttons are disabled when busyId matches the row.
verification-gap | low | src/app/[locale]/dashboard/page.test.tsx:20 | No test verifies that unauthenticated redirect preserves active locale prefix.
acceptance-auditor | n/a | spec-1-14-s14:38 | Auditor checks unauthenticated redirect requirement is satisfied by server page check.
acceptance-auditor | n/a | spec-1-14-s14:45 | Auditor checks delete confirmation requirement is satisfied by window.confirm implementation.
acceptance-auditor | n/a | spec-1-14-s14:48 | Auditor checks toggle publish failure banner requirement is satisfied by actionError alert.
acceptance-auditor | n/a | spec-1-14-s14:49 | Auditor checks create/edit inline error mapping and 409 slug conflict handling match spec.
acceptance-auditor | n/a | spec-1-14-s14:52 | Auditor checks stratum and admin_fee_cop optional field acceptance matches spec matrix.
acceptance-auditor | n/a | spec-1-14-s14:55 | Auditor checks boundary constraints prohibiting migrations and service-role client leaks are fully met.

## TRIAGE
1. patch | Guard async refresh with latest-request counter to prevent race condition overwrites.
2. patch | Redirect to /login when mutation gets 401 instead of displaying generic failure.
3. patch | Catch signOut network exceptions so router.push("/login") always succeeds.
4. patch | Redirect to /login when listing form submission receives 401.
5. patch | Narrow invalid credential error to 400/401/422 and show generic error for 429 and 5xx.
6. defer | Server already enforces MAX_PRICE and MAX_SMALLINT; cosmetic client validation refinement.
7. defer | Spec explicitly notes initial 50 listings with no pagination UI; requires product decision.
8. defer | Pre-existing architecture where RLS gates access; agent role checking belongs in auth middleware.
9. reject | Standard cancel button behavior in Next.js forms; not mandated by spec.
10. defer | Minor accessibility improvement; table layout already associates row cells visually.
11. reject | Server validator and DB check constraints already prevent negative values in the database.
12. defer | Spec explicitly defers token refresh to a future middleware story.
13. reject | The agent listings API only emits 409 on slug uniqueness violations.
14. reject | Row buttons are disabled while busyId is active, preventing concurrent mutations.
15. reject | Standard Next.js route handlers return JSON on validation failures; catch block safely handles fallback.
16. reject | Decimal precision for area_m2 is enforced by Postgres numeric type; extreme float inputs are theoretical.
17. reject | Number() parsing normalizes numeric strings and DB check constraint allows integer 1-6.
18. reject | Cosmetic optimistic UI badge update; exact timestamp refreshed from server on next load.
19. reject | Standard authentication behavior preserving user-provided password characters.
20. reject | Tests properly spy on and mock window.confirm in jsdom.
21. reject | AbortSignal.timeout(15_000) provides deterministic upper bound for network hanging.
22. patch | Add unit test verifying redirect to /login when a mutation returns 401.
23. patch | Add unit test verifying error banner renders when delete fails.
24. patch | Add unit test verifying router.push("/login") executes even if signOut throws.
25. patch | Add unit test verifying form redirects to /login on 401 response.
26. patch | Add unit test asserting generic error message on 429 and 500 status codes.
27. defer | Interaction test for disabled state is secondary to mutation correctness.
28. reject | Next-intl router push handles active locale prefixing automatically.
29. reject | Auditor confirms core ACs are met; mutation timeout is an edge case.
30. reject | Auditor confirms window.confirm satisfies the deletion confirmation requirement.
31. reject | Auditor confirms localized error banner matches the I/O matrix specification.
32. reject | Auditor confirms inline error mapping and 409 slug conflict handling match spec.
33. reject | Auditor confirms new fields are correctly validated per spec criteria.
34. reject | Auditor confirms boundary constraints prohibiting migrations and service-role client leaks are fully met.

FINDINGS_TOTAL: 34
