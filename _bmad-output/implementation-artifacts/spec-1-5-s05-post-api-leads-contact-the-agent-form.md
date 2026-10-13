---
title: 'S05 - POST /api/leads contact-the-agent form'
type: 'feature'
created: '2026-10-13'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Visitors have no way to send an inquiry to the agent from a listing or contact form.

**Approach:** Add `POST /api/leads` (App Router) accepting `{ name, email, phone?, message, listing_id? }`. A `validateLead` helper in `src/lib/leads.ts` checks name (non-blank), email (valid format) and message (non-blank), plus optional phone and UUID `listing_id`, and returns descriptive per-field errors. The route inserts into `leads` with the anon client. Returns `201` on success, `400 { error, errors }` on invalid JSON or payload, `500` on database failure. Vitest tests cover the helper and every route path.

</frozen-after-approval>

## Implementation Notes

- Reuse `createPublicClient`; RLS "anyone submits leads" allows anon insert but anon cannot select, so insert without `.select()`.
- All DB errors map to 500 (including FK/RLS rejections of unknown or unpublished `listing_id`), per the story.

## Review Triage Log

Inline self-review (no subagent launched; not explicitly requested).
- false: anon insert failing on `.select()` — the route inserts without returning rows, so the missing anon select policy is not hit.
- low (rejected): FK/RLS rejection of an unknown or unpublished `listing_id` returns 500 rather than 400 — the story specifies 500 on database failure; distinguishing Postgres codes would add scope.
- low (rejected): no rate limiting or spam protection on the public endpoint — outside S05 scope.

### Review Findings

Code review (2026-10-13), layers: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor. 0 decision-needed, 5 patch, 4 defer, 8 rejected.

- [x] [Review][Patch] No max length on name/message/phone on a public endpoint (caps 200/5000/40) [src/lib/leads.ts]
- [x] [Review][Patch] EMAIL_RE accepted consecutive/leading/trailing dots in the domain (`a@b..c`) [src/lib/leads.ts]
- [x] [Review][Patch] `console.error` logged the whole PostgREST error, whose `details` can echo the rejected row (PII); now logs code and message only [src/app/api/leads/route.ts]
- [x] [Review][Patch] Untested: 254-char email cap, blank phone/listing_id to null, non-string listing_id, length caps [src/lib/leads.test.ts]
- [x] [Review][Patch] Untested: non-object JSON body through the route; error-log PII [src/app/api/leads/route.test.ts]
- [x] [Review][Defer] No rate limiting / spam protection / request body size limit — deferred: outside S05; handle at platform or middleware level
- [x] [Review][Defer] Route tests mock the Supabase client, so the real insert and RLS policy are unverified — deferred: needs a local Supabase integration suite
- [x] [Review][Defer] Unknown or unpublished `listing_id` returns 500 (FK/RLS) — deferred: the story specifies 500; reconsider mapping 23503/42501 to 400 if the form shows stale listings
- [x] [Review][Defer] Leads are only stored; the agent is not notified — deferred: no notification requirement in S05

#### Rejected
- No content-type check (low): `request.json()` fails safely on non-JSON and the fix adds a branch.
- CORS / OPTIONS handling (low): same-origin app, not in scope.
- Blank `listing_id`/`phone` becomes null (low): intended optional-field behavior.
- Spec `status: done` vs sprint `review`; `review_loop_iteration`, `context: []` (false): the fix would edit the spec/bookkeeping; synced below.
- Decision-log vs `last_updated` timestamps; `run-log.jsonl` not in the diff (false): not defects in the code.
- 201 response has no lead id (false): by design, since anon cannot `select`.
- RLS compatibility (false): the insert policy permits anon with null or published `listing_id`, there is no `.select()`, and the payload columns match `public.leads` and its CHECKs.
