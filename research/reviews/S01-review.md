Code review of S01 is done: commit 8dca43b against `main`, which adds the schema migration, RLS policies and Cali seed, with the spec `spec-1-1-s01-schema-and-migrations.md` as context.

I ran the review inline, with no parallel reviewer subagents, and I skipped the checkpoints that wait for your confirmation. The diff is small (about 400 lines), and you didn't ask for subagents. As a result there are no separate Blind Hunter or Edge Case Hunter layers. All findings come from my own pass, and I did not run `supabase db reset` or any RLS queries to test them.

## Findings

**1. Any signup can become an agent (decision needed, high)**
- `supabase/config.toml` has `enable_signup = true` and `enable_confirmations = false`.
- The `agents insert own profile` policy (migration lines 112–115) lets any authenticated user create their own `agents` row.
- With that row they pass the `agents insert own listings` check and can publish listings on the public site.
- The same row satisfies the `listing_id is null and exists (agents…)` branch of the leads select policy (lines 223–227), so they can read every general-inquiry lead, including its personal contact details.
- **Decision for you:** Drop the self-insert policy and provision agents with the service role or the seed. Or keep self-registration and gate it with an allowlist or role claim. I did not patch this because it depends on your intent for agent onboarding.

**2. Agent email and phone are public (decision needed, medium)**
- `agents are publicly readable` uses `using (true)` for `anon`, so the REST API exposes `email` and `phone` for every agent.
- That may be intended for a listing contact card, but it makes the agent's email harvestable.
- **Decision for you:** Expose only `full_name`, `bio`, `avatar_url` and `phone` through a view, or confirm that the email is meant to be public.

**3. No automated test for RLS (defer, medium)**
- The spec says RLS was checked manually after `db reset`, and the repo has no `supabase/tests` directory.
- Nothing stops a later policy change from leaking drafts or leads.
- A pgTAP or Vitest suite should cover these cases: `anon` sees only published listings and images, `anon` cannot read leads, `anon` can insert a lead, and one agent cannot edit another's listing.
- I did not write it because I can't run it here.

**4. `set_updated_at()` had no fixed `search_path` (patch, low) — applied**
- Supabase's security linter flags this as a mutable `search_path`.
- I added `set search_path = ''` to the function. The body only uses `now()` and `new`, so behaviour is unchanged.

## Not acted on
- **Image ordering:** `listing_images` has no unique constraint on `(listing_id, position)`, so duplicate positions are possible. Adding a plain unique constraint would break reordering that swaps positions, so I rejected it as not a simple fix.
- **Leads length limits:** `leads` has no maximum length on `name` or `message`, so a spammer can submit very long text. I left it because the fix adds constraints for a low-impact problem.
- **Redundant extension:** `create extension if not exists pgcrypto` is redundant on Supabase, where it already exists in the `extensions` schema. It's harmless.

I checked the seed: 14 listings, 12 published, with the draft and scheduled rows correctly hidden. The demo user's `password123` is fine for local use only, because `[db.seed]` runs only on `db reset`.

The patch is an uncommitted change to the migration. Tell me how you want to resolve findings 1 and 2, and whether I should write the RLS tests for finding 3.
