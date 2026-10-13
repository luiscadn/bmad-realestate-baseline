# Code Review Findings: Story S09 (ListingCard and results grid with filters panel)

I reviewed S09 (1cd3730 against `main`) and applied two patches. After them, `vitest` passes 231/231, `tsc --noEmit` is clean and lint is clean. I did not rerun `npm run build`.

I ran all four review passes myself in one session, not as separate subagents, because you didn't ask for subagents. I didn't run the BMAD config-resolution scripts or write to `deferred-work.md`. I didn't update the story status or `sprint-status.yaml`; the spec still says `in-review`.

I skipped the Step 1 and patch-selection prompts as you asked. The Acceptance Auditor pass found no spec violations.

**Patches applied (2)**
1. **Language lost without JS:** the filter form always submitted to `/search`, so an English visitor with JavaScript off landed on the Spanish page. The form action now includes the locale prefix (`/en/search` for English, `/search` for Spanish). I added a test in `src/components/SearchFilters.test.tsx`.
2. **Screen readers:** the results section and the result count both had `aria-live="polite"`, so the whole grid would be announced on every update. I removed it from the section in `src/app/[locale]/search/page.tsx` and kept it on the count.

**Deferred (2)**
- **Page past the last page:** a stale link such as `?page=99` shows "no properties match" although total > 0. The fix needs new copy in both catalogs plus a new branch, and it only happens with stale links.
- **Image host list:** `remotePatterns` is built from the Supabase URL at build time, so images from any other host won't load through `next/image`. That matches the spec. Revisit if non-Supabase image URLs appear.

**Rejected (2)**
- `<input type="number">` accepts `1e5`. The server drops it and shows the "invalid filters" notice, so it does no harm.
- A blur followed by Enter pushes the same URL twice. The two pushes are identical and the form remounts on the new URL.

The findings are appended under "Review Findings" in `_bmad-output/implementation-artifacts/spec-1-9-s09-listingcard-and-results-grid-with-filters-panel.md`. The changes are uncommitted.
