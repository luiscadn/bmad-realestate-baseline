All four review layers have finished: Blind Hunter, Edge Case Hunter, Verification Gap and Acceptance Auditor. Nothing was edited, committed or migrated. The findings are below, with triage after the raised list. The Acceptance Auditor's non-violation notes and one self-withdrawn item from the Edge Case Hunter are left out, so they are not counted.

## RAISED

Blind Hunter | high | src/lib/featured-listings.ts:17 | Coordinates may never be fetched, because the Supabase select list is not touched and tests only use mocks.
Blind Hunter | medium | src/components/SearchMap.tsx:n/a | No link between list cards and pins: `selectedId` never gets set from a card, and the selected card is not scrolled into view.
Blind Hunter | medium | src/components/SearchMapView.tsx:n/a | The map shows only the current page of 12 results, while it is presented as where the filtered listings are, and the counts can disagree.
Blind Hunter | low | src/components/SearchMap.tsx:n/a | The map is a plain gradient with no geographic context. Pin positions shift with the filters, MIN_SPAN is applied in degrees after the mercator transform, and overlapping pins or an edge overflow are not handled.
Blind Hunter | medium | src/components/SearchMap.tsx:n/a | Accessibility gaps: no `aria-expanded` or `aria-controls` on pins, the preview is not announced, focus is not returned on close, Escape is bound to the whole document, and the close button is a tiny "×".
Blind Hunter | low | messages/en.json:n/a | A hard-coded "→" in the link text and a duplicate "Map" label (`Search.view.map` and `Search.map.showMap`) go against the spec rule that all strings come from the message catalog.
Blind Hunter | low | src/components/SearchMapView.tsx:n/a | The mobile in-page List/Map tabs sit next to the server Grid/Map toggle, which is confusing.
Blind Hunter | medium | src/app/[locale]/search/page.test.tsx:n/a | Test gaps: no test that the client-side `router.push` path keeps `view`, the "invalid view" test does not check toggle state, the mobile pane assertion on class names is fragile, and the `page` reset on switching views is untested.
Blind Hunter | low | src/lib/map-view.ts:n/a | The type says `number` but numeric strings are accepted, and empty strings and the 0/0 "null island" are not rejected.
Blind Hunter | low | src/components/SearchMapView.tsx:n/a | A stale `selectedId` is not cleared when the listing leaves the page. The mobile default pane is "map", and `priority` is dropped on the first card images.
Blind Hunter | low | _bmad-output/implementation-artifacts/spec-1-11-s11-map-list-toggle-on-search.md:n/a | Spec hygiene: Implementation Notes, Verification and Tasks are empty or unchecked while the status is `review`, with no test or build evidence.
Edge Case Hunter | low | src/lib/map-view.ts:807 | `Math.min(...xs)` spread could throw `RangeError` on very large arrays. The page size of 12 makes this negligible.
Edge Case Hunter | low | src/lib/map-view.ts:786 | A whitespace-only string or a boolean passes `Number()` as finite, so a pin lands at the equator.
Edge Case Hunter | medium | src/components/SearchMap.tsx:270 | A stale `selectedId` stays set after the listing leaves the page. The preview is hidden but the ring highlight is orphaned, and the selection returns later.
Edge Case Hunter | low | src/components/SearchMap.tsx:272 | The document-level Escape handler closes the preview even when the key press belongs to another widget.
Edge Case Hunter | medium | src/components/SearchMapView.tsx:468 | The mobile pane defaults to "map". With JS disabled or before hydration the list is hidden and the tabs do nothing.
Edge Case Hunter | low | src/components/SearchMap.tsx:322 | `next/image` in the preview may fail for hosts not in `remotePatterns`, and there is no `onError` fallback.
Edge Case Hunter | low | src/components/SearchMap.tsx:279 | A null or non-numeric `price_cop` renders "COP NaN" in the pin and the aria-label.
Edge Case Hunter | low | src/components/SearchMap.tsx:299 | Pins with identical or near-identical coordinates stack exactly, so the lower pin cannot be reached.
Edge Case Hunter | low | src/components/SearchMap.tsx:314 | The preview card covers the bottom of the canvas and can hide the lowest pins while it is open.
Verification Gap | medium | src/components/SearchFilters.test.tsx:n/a | No test checks that filter changes keep `view=map` through the client `router.push` path.
Verification Gap | low | src/lib/listings.ts:36 | No test pins the `select("*")` that supplies the coordinate columns. This is a regression risk only if the select is narrowed later.
Verification Gap | low | src/components/SearchMapView.tsx:468 | The mobile default pane "map" is not mentioned in the spec.
Verification Gap | low | src/lib/map-view.ts:786 | `isCoordinate` accepts strings such as "0x10" and " " through `Number()`.
Acceptance Auditor | low | src/components/ViewToggle.tsx:n/a | The toggle uses `aria-current` where the spec matrix says "pressed", with no `aria-pressed`.
Acceptance Auditor | low | src/components/SearchMapView.tsx:n/a | The map shows only the paginated page, not all filtered results, which is arguably against the intent.
Acceptance Auditor | low | src/components/SearchMapView.tsx:n/a | A stale `selectedId` persists when the mobile pane switches or the page changes.
Acceptance Auditor | low | messages/en.json:n/a | The extra `Search.map` keys (`paneLabel`, `showList`, `showMap`) are not in the spec, but the en and es catalogs are in parity.

## TRIAGE

1. Blind Hunter, coordinates may not be fetched: reject. `fetchListings` and the search code use `select("*")`, so the columns come back. Only the regression test is missing (see the `SearchFilters.test.tsx` and `listings.ts` entries below).
2. Blind Hunter, no card-to-pin link: defer. The spec did not ask for it and it is an enhancement.
3. Blind Hunter, map shows only the current page: decision-needed. The spec intent says "filtered listings", so whether the map should cover all results is a product call.
4. Blind Hunter, plain gradient map and pin geometry: defer. A real tile map is out of scope for this story, and overlapping pins are cosmetic.
5. Blind Hunter, accessibility gaps: patch. Add `aria-expanded` and `aria-controls` to pins, announce the preview, return focus to the pin on close, and scope Escape to the map.
6. Blind Hunter, hard-coded "→" and duplicate "Map" label: patch. Minor, but it breaks the all-strings-via-catalog rule.
7. Blind Hunter, two toggles on mobile: defer. This is a UX design question, not a defect.
8. Blind Hunter, test gaps: patch. Add the client `router.push` test (the same gap as the Verification Gap entry below) and tighten the invalid-view and class-name assertions.
9. Blind Hunter, coordinate typing and validation: patch. Reject blank strings and booleans, and align the type with the validation. Merge this with the Edge Case Hunter whitespace finding.
10. Blind Hunter, stale `selectedId`, default pane, `priority`: patch for the stale `selectedId` (same fix as the Edge Case Hunter entry below). Defer the `priority` and default-pane points.
11. Blind Hunter, spec hygiene: defer. The notes and task checkboxes are process artifacts to fill in at closure.
12. Edge Case Hunter, `Math.min` spread: reject. Page size is 12, so there is no real risk.
13. Edge Case Hunter, whitespace or boolean coordinates: patch. It is a one-line guard and a real misplacement bug.
14. Edge Case Hunter, stale `selectedId`: patch. Clear the selection when the listing is no longer in `pins`.
15. Edge Case Hunter, global Escape: patch. Scope it to the map or ignore `defaultPrevented` events.
16. Edge Case Hunter, mobile default "map" before hydration: decision-needed. Defaulting to the list would be safer without JS, but the choice is a product call.
17. Edge Case Hunter, `next/image` hosts: defer. It is the same image setup the rest of the app uses, so it is unlikely to be new here.
18. Edge Case Hunter, null `price_cop`: reject. The column is NOT NULL and the existing cards already format it the same way.
19. Edge Case Hunter, stacked pins: defer. Clustering is out of scope for this story.
20. Edge Case Hunter, preview covers lowest pins: defer. Minor layout polish.
21. Verification Gap, no `view=map` test on the client push path: patch. Add the `routerPush` test in `SearchFilters.test.tsx`; this is the same point as finding 8.
22. Verification Gap, no test pins the select: defer. It is a regression-only risk.
23. Verification Gap, mobile default pane not in spec: defer. This overlaps with finding 16.
24. Verification Gap, `isCoordinate` accepts "0x10": reject. It is harmless for PostgREST numerics, and finding 13 already covers the real case.
25. Acceptance Auditor, `aria-current` instead of pressed: reject. The links are navigation, so `aria-current` is the correct semantics.
26. Acceptance Auditor, map shows only the paginated page: decision-needed. This duplicates finding 3.
27. Acceptance Auditor, `selectedId` persists across the pane switch: reject. The selection should survive a pane switch, and the stale-page case is finding 14.
28. Acceptance Auditor, extra `Search.map` keys: reject. They back the mobile tabs, both catalogs are in parity, and it is informational only.

FINDINGS_TOTAL: 28