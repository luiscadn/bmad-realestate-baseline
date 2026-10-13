---
title: 'S01 - Schema, RLS and seed for agents, listings, listing_images, leads'
type: 'feature'
created: '2026-10-13'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The platform has no database schema. Without tables, RLS and seed data, no API or UI story can proceed.

**Approach:** Add a Supabase migration creating `agents`, `listings` (with `published_at`, `open_house_at`), `listing_images` (with `position`) and `leads`, with RLS (public reads only published listings and their images; agents manage their own rows; anyone may insert leads), plus `supabase/seed.sql` with >= 12 original listings in Cali neighborhoods.

</frozen-after-approval>

## Implementation Notes

- Verify with `npx supabase db reset` against local Supabase, then check RLS as `anon`.
- Files: `supabase/migrations/20261013000000_init_schema.sql`, `supabase/seed.sql`.
- Verified after `supabase db reset`: 14 seeded listings (12 published, 1 draft, 1 scheduled) across 6 neighborhoods; anon sees 12 listings / 36 images, cannot read or update leads/listings; anon can insert a lead; demo agent sees all 14.
- Seed creates a demo auth user (agent@victoriaordonez.test) so `agents.id` can reference `auth.users`.
- Review subagents were not launched (not requested in this session); no review triage recorded.
