# Code Review Findings: Story S11 (Map/list toggle on /search)

I reviewed S11 (commit be965e7 vs main) with all four reviewers and patched five issues. All 295 tests pass, and `tsc` and `eslint` report nothing. I did not run `npm run build`, and I haven't committed the patches.

## Patched
1. **Reset links dropped `view=map`.** The empty/error-state "Limpiar filtros" button in `SearchResults.tsx` and the clear link in `SearchFilters.tsx` both went to a bare `/search`. They now keep `view=map`. This was a break of "filters preserve `view`", and I added a test for the empty-state button.
2. **Map was distorted.** `map-view.ts` scaled longitude and latitude independently, which stretched the pins. Both axes now share one span, and I added a test for it.
3. **Bad coordinates pinned at 0,0.** `isCoordinate` accepted blank strings and booleans because they coerce to 0. It now accepts only numbers and non-blank strings, with a test.
4. **Weak pane-switch test.** The class checks in `SearchMapView.test.tsx` matched substrings, so `"block"` also matched `"hidden lg:block"` and the test passed either way. It now compares exact class tokens.
5. **Not a bug, but you asked about it: filters keep `view` when JS rewrites the URL.** `SearchFilters` builds the URL from `FormData`, which includes the hidden `view` input, so the view carries through. Two reviewers flagged this as unconfirmed; I checked and it works.

## Deferred (not patched)
- Pins at identical coordinates stack, so only the top one is clickable.
- The preview card can cover pins near the bottom of the map.
- Rent and sale pins share styling (no "/month" on rent pins).
- On mobile the default tab is "map", so the selected-card ring in the list is hidden. Selecting a pin doesn't scroll to its card, and clicking a card doesn't select its pin.
- After the preview closes, focus doesn't return to the pin.
- A stale `selectedId` can survive a page change.
- The map only covers the current page of results.
- The spec's Implementation Notes and task checkbox are empty. This is a spec-hygiene item.

## Dismissed
- `fetchListings` does fetch `latitude` and `longitude`. It selects `*`, and the init migration defines the columns.
- An out-of-range page number, an empty image URL and a non-numeric price are all handled the same way outside this change, or typed away.
- The acceptance auditor's remaining notes were already met or had no spec impact.

The spec's acceptance criteria are met: pins match listings with coordinates, the preview links to the listing, and the es/en keys match.
