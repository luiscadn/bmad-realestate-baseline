## RAISED

Severity is my own grade after reading the code. The reviewing layers did not assign severities.
`MIG` = `supabase/migrations/20261013000000_init_schema.sql`.

```
Blind Hunter | medium | MIG:n/a | leads has no UPDATE/DELETE policy and no status columns, so agents cannot mark leads handled or delete them.
Blind Hunter | medium | MIG:n/a | Policy "agents read leads…" lets every agent read all listing_id-null leads, and on delete set null turns a deleted listing's leads into such leads.
Blind Hunter | low | MIG:n/a | Anonymous lead insert has no rate limit, no length limits and only a weak email check.
Blind Hunter | low | MIG:n/a | Anon insert on leads with returning/Prefer: return=representation fails because anon has no SELECT policy on leads.
Blind Hunter | low | MIG:n/a | listing_images.position is not unique per listing, so gallery order can be ambiguous.
Blind Hunter | low | MIG:n/a | open_house_at has no check against published or future state.
Blind Hunter | low | MIG:n/a | Slug is globally unique but has no change/redirect rule, so changing it breaks URLs.
Blind Hunter | low | MIG:n/a | neighborhood is free text with no enum or lookup, so spelling variants will break filters.
Blind Hunter | low | MIG:n/a | agents.email duplicates auth.users.email with no uniqueness or sync.
Blind Hunter | low | MIG:n/a | agents.id cascades on auth user delete but listings.agent_id is restrict, so deleting an auth user fails opaquely.
Blind Hunter | low | MIG:n/a | Agents can freely set published_at and featured on their own listings.
Blind Hunter | low | MIG:n/a | Agents can edit created_at.
Blind Hunter | low | MIG:n/a | set_updated_at has no pinned search_path, and agents has no updated_at.
Blind Hunter | low | MIG:n/a | No explicit grant/revoke statements, so access relies on Supabase default grants.
Blind Hunter | low | MIG:n/a | published_at <= now() cannot use the partial index on published_at is not null.
Blind Hunter | low | MIG:n/a | No full-text or trigram index for searching title, description or neighborhood.
Blind Hunter | low | MIG:n/a | No index on leads.created_at or on price sort, and listings_filter_idx omits neighborhood, bedrooms and featured.
Blind Hunter | low | supabase/seed.sql:n/a | Seed hardcodes password123 with no guard against running on a remote or staging database.
Blind Hunter | low | supabase/seed.sql:n/a | Seed uses relative now() times, so data is non-deterministic across resets.
Blind Hunter | low | supabase/seed.sql:n/a | Seed images use picsum.photos URLs that will not match the future storage bucket.
Blind Hunter | low | _bmad-output/implementation-artifacts/spec-1-1-s01-schema-and-migrations.md:n/a | Spec's "36 images" claim does not match the 3-images-per-listing seed.
Blind Hunter | medium | MIG:n/a | No automated RLS tests (pgTAP or SQL), so the RLS claims are not reproducible in CI.
Blind Hunter | low | MIG:n/a | No down/rollback migration and no regenerated TypeScript DB types for downstream stories.
Blind Hunter | low | _bmad-output/implementation-artifacts/sprint-status.yaml:n/a | Sprint status says review while the spec says done.
Blind Hunter | low | _bmad-output/implementation-artifacts/spec-1-1-s01-schema-and-migrations.md:n/a | Spec says review subagents were not launched, yet the story moved to review.
Blind Hunter | low | _bmad-output/implementation-artifacts/sprint-status.yaml:n/a | Spec filename differs from the sprint-status key.
Blind Hunter | low | MIG:n/a | agents has no DELETE policy.
Blind Hunter | low | supabase/seed.sql:n/a | Seed inserts into auth.users and auth.identities with internal columns that may break on Supabase CLI upgrades.
Blind Hunter | low | _bmad-output/implementation-artifacts/spec-1-1-s01-schema-and-migrations.md:n/a | Spec has empty context and route 'oneshot', leaving no recorded acceptance criteria.
Edge Case Hunter | medium | MIG:n/a | Deleting a listing sets leads.listing_id to null, making those leads readable by every agent.
Edge Case Hunter | medium | MIG:n/a | General (listing_id null) leads have no owner, so any agent can read all of them.
Edge Case Hunter | low | MIG:n/a | Anon lead insert has no limits on name, message or phone length.
Edge Case Hunter | low | MIG:n/a | Anon insert with returning fails with an RLS violation.
Edge Case Hunter | low | MIG:n/a | Two images for one listing can share the same position.
Edge Case Hunter | low | MIG:n/a | listing_images.url accepts any text, including empty strings or non-http schemes.
Edge Case Hunter | low | MIG:n/a | Only one of latitude/longitude can be supplied.
Edge Case Hunter | low | MIG:n/a | open_house_at can be set on drafts or unpublished listings.
Edge Case Hunter | low | MIG:n/a | set_updated_at has a mutable search_path.
Edge Case Hunter | low | MIG:n/a | No unpublish state, so sold/withdrawn listings stay visible while published_at is in the past.
Edge Case Hunter | medium | MIG:n/a | Any authenticated user can insert their own agents row and so become an agent who can publish listings and read general leads.
Edge Case Hunter | low | MIG:n/a | agents is fully public to anon, including email and phone.
Edge Case Hunter | low | MIG:n/a | Deleting an auth user who owns listings fails because of on delete restrict.
Edge Case Hunter | low | supabase/seed.sql:n/a | Seed could fail on re-run or if crypt/gen_salt is not on the search_path.
Edge Case Hunter | low | supabase/seed.sql:n/a | Images are seeded for draft and scheduled listings, so the anon "36 images" count depends on RLS.
Edge Case Hunter | low | _bmad-output/implementation-artifacts/spec-1-1-s01-schema-and-migrations.md:n/a | Claim "anyone may insert leads" is narrower in the policy, which rejects leads on unpublished listings.
Edge Case Hunter | low | _bmad-output/implementation-artifacts/spec-1-1-s01-schema-and-migrations.md:n/a | Cross-agent isolation (agent B vs agent A's rows) is not recorded as verified.
Verification Gap | medium | MIG:n/a | RLS policies and seed counts have no automated test, and the only test in the repo is expect(true).toBe(true).
Verification Gap | low | MIG:n/a | Anon insert on leads with returning fails because anon has no SELECT policy on leads.
Verification Gap | low | supabase/seed.sql:n/a | Seed ships a known password for an auth user, with no check that seed runs only locally.
Verification Gap | low | _bmad-output/implementation-artifacts/sprint-status.yaml:n/a | Story marked review with no triage recorded in the spec.
Acceptance Auditor | low | _bmad-output/implementation-artifacts/sprint-status.yaml:n/a | Spec status done conflicts with sprint status review.
Acceptance Auditor | low | MIG:n/a | Leads insert policy is narrower than the literal "anyone may insert leads".
Acceptance Auditor | medium | MIG:n/a | Agents can read all null-listing leads, and leads of deleted listings, which does not match "agents manage their own rows".
Acceptance Auditor | low | MIG:n/a | Agents cannot delete their own profile row.
Acceptance Auditor | low | supabase/seed.sql:n/a | Seed depends on the Supabase auth schema version, and the db reset verification cannot be confirmed from the diff.
Acceptance Auditor | low | supabase/seed.sql:n/a | Images use external picsum.photos URLs, so "original" content is not strictly met for images.
```

## TRIAGE

1. defer: lead triage and deletion belong to a later leads-management story.
2. decision-needed: whether general or orphaned leads should be agent-owned is a product choice.
3. defer: abuse limits are better added at the API layer in S03/S04.
4. reject: plain insert works and no returning is a normal PostgREST pattern.
5. defer: a unique (listing_id, position) index needs the reorder strategy decided first.
6. reject: no spec requirement.
7. reject: slug handling is an application concern.
8. reject: a lookup table is out of scope for S01.
9. reject: the copy is intentional so the profile can be public.
10. defer: handle agent offboarding when auth management is built.
11. reject: this is intended, since agents manage their own listings.
12. reject: negligible.
13. patch: add `set search_path = ''` to the function. It is a trivial, unambiguous fix.
14. reject: Supabase default grants plus RLS are the standard pattern.
15. reject: false, because Postgres can use a partial index for `published_at <= now()`, which implies `is not null`.
16. reject: search is out of scope.
17. reject: speculative indexing.
18. defer: the comment says local only, so add a guard when a deploy pipeline exists.
19. reject: relative dates are intentional.
20. reject: placeholders are fine.
21. reject: false, 12 published × 3 = 36 is consistent.
22. defer: add a Supabase-backed test harness with the S03/S04 API stories.
23. reject: out of scope.
24. reject: the fix would edit the spec or sprint file.
25. reject: process note, and the fix edits the spec.
26. reject: naming only.
27. reject: low impact, since the agents row cascades from auth.
28. reject: `db reset` was verified per the spec notes.
29. reject: the fix edits the spec.
30. decision-needed: same root as 2.
31. decision-needed: same root as 2.
32. defer: same as 3.
33. reject: same as 4.
34. defer: same as 5.
35. reject: an img src is not executable and the values are agent-controlled.
36. reject: low impact and not required.
37. reject: same as 6.
38. patch: same as 13.
39. reject: nulling published_at is the unpublish mechanism, and a status column is outside the spec.
40. decision-needed: whether agent self-signup should be allowed is a policy choice.
41. reject: the spec says agents are public profiles shown on listing detail.
42. defer: same as 10.
43. reject: seed runs after the migration on `db reset`, and it was verified.
44. reject: hiding those images is exactly what RLS is meant to do.
45. reject: the hardening is sensible and the spec's "anyone" is satisfied for valid targets.
46. defer: covered by the automated RLS test item (22).
47. defer: same as 22.
48. reject: same as 4.
49. defer: same as 18.
50. reject: process, and the fix edits the spec or sprint file.
51. reject: same as 24.
52. reject: same as 45.
53. decision-needed: same root as 2.
54. reject: same as 27.
55. reject: same as 28.
56. reject: same as 20.

FINDINGS_TOTAL: 56