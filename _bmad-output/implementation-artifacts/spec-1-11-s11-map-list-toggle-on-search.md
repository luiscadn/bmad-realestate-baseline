---
title: 'S11 Map/list toggle on /search'
type: 'feature'
created: '2026-10-13'
status: 'in-review'
route: 'dispatch'
review_loop_iteration: 0
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** /search only offers a grid; visitors cannot see where the filtered listings are.

**Approach:** A `view=grid|map` URL param (default grid) driven by a server-rendered toggle. Map view is a split layout: cards on one side, a dependency-free pin map (Web Mercator projection of each listing's latitude/longitude) on the other, with a preview card on pin selection.

## Boundaries & Constraints

**Always:** All strings via next-intl (es + en, key parity). Toggle preserves filters; filters/pagination preserve `view`. Listings without coordinates stay in the list, not on the map. Prices in COP. Preview links to `/listings/[slug]` via the i18n `Link`.

**Never:** No new npm dependency, no third-party tile/API calls. No change to the API or DB schema.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Default | no `view` | grid view, toggle shows Grid pressed | N/A |
| Map | `view=map` | split view, one pin per listing with coords | N/A |
| Invalid view | `view=foo` | grid | silently ignored |
| Select pin | click pin | preview card (image, COP price, title, neighborhood badge, link) | Esc/close clears |
| No coords | all listings lack lat/lng | map shows "no location" message, list still shown | N/A |

</frozen-after-approval>

## Code Map

- `src/app/[locale]/search/page.tsx` -- parse `view`, render toggle + grid or map view
- `src/components/SearchResults.tsx` -- grid; keep, add `view` to pagination query
- `src/components/SearchFilters.tsx` -- add hidden `view` input so filters keep the view
- `src/lib/featured-listings.ts` -- add optional latitude/longitude to type
- `src/lib/map-view.ts` (new) -- parseView, projection of coords to % positions
- `src/components/ViewToggle.tsx`, `SearchMap.tsx`, `SearchMapView.tsx` (new)
- `messages/{es,en}.json` -- `Search.view`, `Search.map`

## Tasks & Acceptance

**Execution:**
- [ ] lib + components + page wiring + messages + Vitest tests for each

**Acceptance Criteria:**
- Given `view=map`, when the page renders, then pins match listings with coordinates and selecting one shows the preview card with a link to the listing.
- Given es and en catalogs, then keys are identical.

## Implementation Notes

## Verification

**Commands:**
- `npm test` -- all pass
- `npm run build` -- succeeds
