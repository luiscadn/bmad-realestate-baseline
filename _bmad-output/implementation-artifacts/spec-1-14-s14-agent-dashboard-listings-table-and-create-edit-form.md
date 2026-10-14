---
title: 'S14 Agent dashboard: listings table and create/edit form'
type: 'feature'
created: '2026-10-13'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '02ea8a35a83e0046a2ded71ed2da7278c9d4c3a9'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The agent can only manage listings through the raw `/api/agent/listings` API; there is no login or UI. `stratum` and `admin_fee_cop` exist in the DB but the API validator rejects/ignores them.

**Approach:** Add `/login` (Supabase email/password) and a protected `/dashboard` with a listings table (title, neighborhood, COP price, Published/Draft badge, Edit / Publish-Unpublish / Delete) and a create/edit form, all calling `/api/agent/listings` with the session cookie. Extend the API validator with `stratum` and `admin_fee_cop`. All strings from next-intl `es`/`en` catalogs with key parity.

## Boundaries & Constraints

**Always:** Dashboard page checks the Supabase cookie session server-side and redirects to `/login` (locale-aware) when absent; login redirects to `/dashboard` on success and when already signed in. Mutations go through the API only (no direct table access from the browser). Delete requires confirmation. Publish toggle uses PATCH `{published}`.

**Never:** No image upload (deferred), no new DB migration, no service-role key in client code, no hard-coded user-facing strings, no changes to existing API behavior beyond the two new optional fields.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Unauthenticated dashboard | no session | redirect to `/login` | N/A |
| Login ok | valid credentials | redirect to `/dashboard` | N/A |
| Login bad | wrong password / empty field | inline localized error, stays on page | no raw Supabase message shown |
| Table | listings returned | row per listing with badge + actions | empty state; load error with retry |
| Toggle publish | Published row | PATCH `{published:false}`, badge flips to Draft | localized error banner on failure |
| Delete | confirm accepted | DELETE, row removed | cancel = no request; failure banner |
| Create | valid form | POST (omit slug when blank), back to table | field errors from API mapped inline; 409 slug message |
| Edit | existing listing | form prefilled, PATCH on save | same as create |
| Form validation | missing title/neighborhood/price, bad stratum (not 1–6) | blocked client-side with localized field errors | N/A |
| API new fields | `stratum` 1–6 or null; `admin_fee_cop` ≥0 integer or null | accepted | 400 with field error otherwise |

</frozen-after-approval>

## Code Map

- `src/lib/agent-listings.ts` -- `validateListingInput`; add `stratum`, `admin_fee_cop`, `ListingFields`.
- `src/lib/agent-auth.ts` -- cookie client creation; add server-component session check reuse.
- `src/lib/agent-route.ts`, `src/app/api/agent/listings/**` -- existing API (list/create/PATCH/DELETE); unchanged.
- `src/lib/listings-query.ts` -- `OPERATIONS`, `PROPERTY_TYPES`.
- `src/components/NewsletterForm.tsx` -- form idiom (useId, aria-invalid, fieldClass).
- `src/test/setup.tsx`, `src/test/render.tsx` -- mocks and `renderWithIntl`.
- `src/lib/site.ts` -- `AGENT_SIGN_IN_HREF = "/login"` already used by header.
- `messages/{es,en}.json`, `src/i18n/i18n.test.ts` -- catalogs and parity test.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/agent-listings.ts` + test -- accept `stratum`, `admin_fee_cop`
- [x] `src/lib/supabase-browser.ts`, `src/lib/agent-auth.ts` -- browser client; `getSessionUser()` for server pages
- [x] `src/lib/dashboard.ts` + test -- form types, validation, payload mapping, API error mapping
- [x] `src/components/{LoginForm,ListingsTable,ListingForm,DashboardClient}.tsx` + tests
- [x] `src/app/[locale]/{login,dashboard}/page.tsx` + tests -- redirects
- [x] `messages/es.json`, `messages/en.json` -- `Login`, `Dashboard` namespaces

**Acceptance Criteria:**
- Given no session, when visiting `/dashboard`, then the visitor is redirected to `/login`.
- Given the I/O matrix, then every row is covered by a passing test; `npm test`, `npm run lint` and `npm run build` pass.

## Implementation Notes

- Dashboard fetches client-side via `/api/agent/listings?limit=50` (cookie session); first 50 listings only, no pagination UI.
- `getSessionAgent()` split out of `getAgent` in `agent-auth.ts` for server pages.
- Verified: `npm test` (374 pass), `npm run lint`, `npm run build`; `next start` shows `/dashboard` → 307 `/login` (and `/en/login`).
- Image upload from the epic text was not in the requested ACs; left out.

## Spec Change Log

## Review Triage Log

### Review Findings

- [x] [Review][Patch] Mutations (publish/delete) and form save treat 401 as a generic failure instead of redirecting to /login [DashboardClient.tsx mutate, ListingForm.tsx onSubmit] — fixed + tests
- [x] [Review][Patch] Out-of-order `refresh()` responses can overwrite newer data [DashboardClient.tsx refresh] — fixed with a latest-request guard
- [x] [Review][Patch] `signOut()` rejection became an unhandled rejection [DashboardClient.tsx signOut] — fixed (catch, still navigates) + test
- [x] [Review][Patch] Any 4xx (e.g. 429 rate limit) reported as "wrong password" [LoginForm.tsx] — now only 400/401/422; 429/5xx/no-status show generic; tests added
- [x] [Review][Patch] Delete-failure banner untested [DashboardClient.test.tsx] — test added
- [x] [Review][Defer] Only first 50 listings loaded, no pagination — deferred: needs product decision (load more vs pagination)
- [x] [Review][Defer] No agent-role check; any authenticated user reaches /dashboard (RLS is the only gate) — deferred: pre-existing auth model from S-agent API
- [x] [Review][Defer] Expired access token not refreshed on page load (`setAll` no-op) — deferred: spec assigns refresh to a later middleware story
- [x] [Review][Defer] Server-side max bounds (MAX_PRICE/MAX_AREA/smallint) not mirrored client-side; lossy server-error messages — deferred: low, cosmetic

**Rejected:** `getSessionAgent` throwing on missing env → 500 (loud config failure, correct); `AbortSignal.timeout` on old Safari (<16, out of support); 409 = non-slug conflict (API only returns 409 for slug uniqueness); `published_at` client clock (cosmetic, refreshed on next load); `busyId` single-row tracking (row actions already disabled while busy, low impact); missing DB migration for stratum/admin_fee (spec: columns pre-exist, no migration by design); a11y/UX nits (row-specific button names, window.confirm, en-US currency, titles, forgot-password) and suggestions outside S14 scope; stale-edit last-write-wins (no version column exists).

## Verification

**Commands:**
- `npm test` -- all pass
- `npm run build` -- succeeds
