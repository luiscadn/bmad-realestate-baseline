**Code review complete.** 0 `decision-needed`, 5 `patch` (all applied), 4 `defer`, 8 rejected.

All four layers ran: Blind Hunter, Edge Case Hunter, Verification Gap and Acceptance Auditor. The Acceptance Auditor found no acceptance-criteria violations. After the patches, `vitest` (33 tests across the two leads files), `tsc` and lint all pass. Nothing is committed; the patches are in the working tree.

**Patches applied**
- **Length caps:** `name`, `message` and `phone` had no maximum length, so the public endpoint could store arbitrarily large strings. Caps are now 200, 5000 and 40 characters (`src/lib/leads.ts`).
- **Email regex:** it accepted `a@b..c`, `a@.b.c` and `a@b.c.`. The domain part is tightened so these are rejected.
- **PII in logs:** `console.error` logged the whole Postgres error, whose `details` can echo the rejected row, including the email. It now logs only `code` and `message` (`src/app/api/leads/route.ts`).
- **Helper tests added:** the 254-character email boundary, blank `phone`/`listing_id` becoming null, a non-string `listing_id`, the new length caps, and the new bad-email cases.
- **Route tests added:** a JSON array body returns 400, and a test that the error log doesn't contain the email.

**RLS compatibility:** this checked out. The "anyone submits leads" policy lets anon insert when `listing_id` is null or the listing is published. The route inserts without `.select()`, so the missing anon read policy isn't hit. The payload columns match `public.leads` and its CHECK constraints.

**Deferred** (written to `deferred-work.md`)
- There is no rate limiting, spam protection or request body size limit.
- The route tests mock Supabase, so the real insert and RLS policy aren't exercised. This needs a local-Supabase integration check.
- An unknown or unpublished `listing_id` returns 500, as the story specifies. Consider mapping Postgres codes 23503 and 42501 to 400 if the form can send stale listings.
- Leads are only stored; nothing notifies the agent.

**Rejected:** the content-type check and CORS (low value for the added branches), blank optional fields becoming null (intended), and several bookkeeping or spec-edit items.

The findings are in the spec's `### Review Findings` section. I marked S05 `done` in `sprint-status.yaml`, but I left its `last_updated` timestamp unchanged. The spec has no Tasks/Subtasks section, so I appended the findings under the existing triage log. `research/run-log.jsonl` was already modified before the review and I didn't touch it.

What next: start the next story, re-run the review, or stop here?
