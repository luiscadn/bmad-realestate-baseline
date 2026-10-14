---
title: 'S13 Newsletter subscribers table and policies'
type: 'feature'
created: '2026-10-13'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Newsletter submissions from Story S12 have no backend storage table or API endpoint.

**Approach:** Create database table `newsletter_subscribers` with unique email constraint, timestamp, and RLS policies (anon insert allowed, public select forbidden to prevent email harvesting, authenticated agents can view). Implement endpoint `POST /api/newsletter` validating input and handling duplicates gracefully (200/201 idempotent response).

## Boundaries & Constraints

**Always:** Unique email constraint, anon insert permitted via RLS, public select forbidden. Duplicates handled idempotently with 200/201 response, never crashing with 500 or Postgres 23505 unique violation. Return 400 for invalid email.

**Never:** Expose subscriber emails to public read. Leak database internals in error responses.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Valid subscription | `{ email: "user@example.com", name: "User" }` | 201 `{ ok: true, message: "Subscribed" }` | N/A |
| Duplicate email | existing email | 200 `{ ok: true, status: "already_subscribed" }` | Graceful idempotent handling |
| Invalid email | `invalid-email` | 400 `{ error: "Invalid email" }` | 400 validation error |
| Invalid JSON body | malformed syntax | 400 `{ error: "Invalid JSON" }` | 400 |

</frozen-after-approval>

## Code Map

- `supabase/migrations/20261013000300_newsletter_subscribers.sql` -- schema, unique constraint, RLS policies
- `src/lib/newsletter.ts` -- parser and validator
- `src/app/api/newsletter/route.ts` -- POST endpoint
- `src/app/api/newsletter/route.test.ts`, `src/lib/newsletter.test.ts` -- tests

## Tasks & Acceptance

**Execution:**
- [x] migration `newsletter_subscribers` table + RLS
- [x] `POST /api/newsletter` endpoint
- [x] parseNewsletterBody and tests
- [x] live test and Vitest suites

**Acceptance Criteria:**
- Given valid email, `POST /api/newsletter` returns 201 and inserts subscriber.
- Given duplicate email, endpoint returns 200 without throwing 500.
- Given invalid email, returns 400.

### Review Findings

- [x] [Review][Patch] Control characters in email caused 500 in Postgres; rejected with 400 in parseNewsletterBody [src/lib/newsletter.ts]
- [x] [Review][Defer] Subscriber probing (200 vs 201 reveals existing emails) and rate limiting
- [x] [Review][Defer] JS toLowerCase() vs Postgres lower() edge case for non-ASCII email casing
- [x] [Review][Defer] Consent record persistence

