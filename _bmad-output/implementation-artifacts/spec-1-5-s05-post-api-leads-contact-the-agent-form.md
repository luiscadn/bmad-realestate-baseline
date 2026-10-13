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
