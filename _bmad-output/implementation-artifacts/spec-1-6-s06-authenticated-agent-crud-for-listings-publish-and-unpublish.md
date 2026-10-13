---
title: 'S06 - Authenticated agent CRUD for listings, publish and unpublish'
type: 'feature'
created: '2026-10-13'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Agents have no API to manage their listings, and nothing verifies who is calling.

**Approach:** Add `GET/POST /api/agent/listings` and `GET/PATCH/DELETE /api/agent/listings/[id]`. `requireAgent` in `src/lib/agent-auth.ts` authenticates via `Authorization: Bearer <jwt>` or the Supabase session cookie (`@supabase/ssr`) and returns a user-scoped client, so RLS enforces ownership; routes also filter by `agent_id`. Missing/invalid auth returns `401`; invalid JSON, ids or fields return `400` with per-field errors; a listing that is absent or owned by another agent returns `404`. `PATCH` accepts `published: boolean` to set `published_at` to now / null. `validateListingInput` in `src/lib/agent-listings.ts` validates create (required fields) and patch (partial) payloads. Vitest covers helpers and every route path.

</frozen-after-approval>

## Implementation Notes

- Slug is optional on create; when omitted it is derived from the title plus a random suffix. Explicit duplicate slug returns 409 (Postgres 23505).
- FK 23503 on create (no `agents` row for the user) returns 403.
- Route tests mock `@/lib/agent-auth`; auth helper tests mock the Supabase clients.

## Review Triage Log

Inline self-review (no subagent launched; not explicitly requested).
- low (deferred): `PATCH { published: true }` on an already-published listing resets `published_at` to now, changing its "newest" ordering; fixing needs a read-before-write.
- low (rejected): cookie sessions are not refreshed in route handlers (`setAll` is a no-op); belongs with a middleware story.
- low (rejected): no CSRF protection for cookie-authenticated mutations; Supabase cookies are SameSite=Lax by default and JSON bodies are required.
- false: ownership bypass via `agent_id` in the payload — the validator drops it and the route sets it from the verified user; RLS also enforces it.
