# Code Review Findings: Story S14 (Agent Dashboard: Listings Table and Create/Edit Form)

**Code review complete for S14.** There were 0 `decision-needed`, 5 `patch` (all applied), 4 `defer` and 8 rejected. The full suite passes (381 tests), and `tsc` and `eslint` are clean. Nothing is committed.

All four reviewers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor) ran. Acceptance Auditor found no violations of the spec's boundaries. I did not pause at the Step 1 checkpoint or at the patch-choice prompt, as you asked.

**Patches applied**
1. **401 on a mutation or save:** publish, delete and the form save showed a generic error when the session had expired. They now redirect to `/login`, as the list load already did (`DashboardClient.tsx`, `ListingForm.tsx`).
2. **Stale list response:** a slow earlier `refresh()` could overwrite newer data. Only the latest request can now write state.
3. **Sign-out failure:** a rejected `signOut()` became an unhandled rejection. It is now caught and the user still goes to `/login`.
4. **Login errors:** any 4xx, including a 429 rate limit, showed "wrong password". Only 400, 401 and 422 do now. Other statuses show the generic message (`LoginForm.tsx`).
5. **Test gaps:** I added tests for 5xx, 429 and no-status login errors, a 401 on a mutation, a 401 on form save, a failed delete, and a sign-out that throws.

**Deferred** (written to `deferred-work.md`)
- Only the first 50 listings load, with no pagination. This needs a product decision.
- There is no agent-role check, so any authenticated user can open `/dashboard` and RLS is the only gate.
- The session token isn't refreshed on page load. The spec leaves that to a later middleware story.
- Client validation has no upper bounds matching the server's limits, so over-limit values get generic server-error messages.

**Rejected**
- Missing env vars making `getSessionAgent` throw: that is a loud config failure, which is correct.
- Old Safari lacking `AbortSignal.timeout`: out of support.
- A 409 that isn't a slug conflict: the API only returns 409 for slug uniqueness.
- A missing migration for `stratum` and `admin_fee_cop`: the spec says no migration is needed.
- The client-clock `published_at`.
- Single-row busy tracking.
- Last-write-wins on stale edits: there is no version column.
- Accessibility and copy nits, such as row-specific button names, `window.confirm` and the `en-US` currency format.

The spec's status and the `sprint-status.yaml` entry for S14 are now `done`, and the findings are in the spec's Review Triage Log.
