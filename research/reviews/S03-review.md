**Code review complete for S03: 0 decision-needed, 1 patch (applied), 1 deferred, 4 rejected.** The suite now has 40 passing tests, up from 38, and `tsc` is clean.

I ran the review myself rather than launching the BMAD reviewer subagents, since you didn't ask for any. The Blind Hunter, Edge Case Hunter, Verification Gap and Acceptance Auditor layers did not run as separate agents. I did not run the `uv run` activation scripts either. I also didn't stop at the BMAD "choose how to handle patches" checkpoint, because you asked me to apply patches.

**Patched (medium)**
- `bedrooms` and `bathrooms` accepted any safe integer. The schema stores them as `smallint`, so a request like `?bedrooms=40000` would very likely make Postgres raise "out of range", and the route would return a 500 instead of a 400. I couldn't confirm that against a live database.
- The fix is a `MAX_SMALLINT` (32767) cap in `src/lib/listings-query.ts`, plus tests for values just above it.

**Deferred (low, unverified)**
- PostgREST treats `*` in `ilike` values as `%`. A request like `neighborhood=Gran*` would therefore act as a wildcard instead of an exact match, and the `escapeLike` call in `src/lib/listings.ts` doesn't cover that.
- I couldn't check this without a live PostgREST, so it is logged in `deferred-work.md` rather than patched.

**Rejected after checking**
- Duplicate query params use the first value, which the spec's triage log already covers.
- `neighborhood` length is unbounded, but URL length limits bound it.
- The client-side `published_at <= now()` filter could drift from the database clock, but RLS enforces the real bound.
- The exact `count` on every request costs a little, which is fine at this scale.

**Confirmed fine**
- Sorting uses an `id` tiebreaker, so pages never overlap or skip rows.
- The past-the-end `PGRST103` fallback returns an empty page with the real total.
- The 500 response is generic and doesn't leak the database error.
- Images are ordered by `position` within each listing.

The findings are appended to the `### Review Findings` section of the S03 spec file. I did not change the story status or `sprint-status.yaml`; S03 is still `review` there. Nothing is committed.
