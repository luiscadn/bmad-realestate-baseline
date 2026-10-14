---
title: 'S16 - Miami and Biscayne Bay interactive projection map'
type: 'feature'
created: '2026-10-14'
status: 'ready-for-review'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '1611c6d3659fb2193f5451999971c2a1334c2678'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The interactive map on `/search` currently formats prices in Colombian Pesos (`COP`) and displays Colombian neighborhoods. For Victoria Ordoñez's Miami ultra-luxury residences (Aston Martin Residences, Porsche Design Tower, Una Residences, etc.), pins and previews must format prices in USD with compact luxury pin badges (e.g. `$25M`, `$4.75M`, `$3.85M`) and accurately locate properties along the Miami and Biscayne Bay coastline.

**Approach:**
1. Update `SearchMap.tsx` and `map-view.ts` to format pins in compact USD luxury currency (`$X.XM` or `$XXM`).
2. Ensure pin projection properly frames Miami waterfront towers (Brickell, Downtown Miami, Biscayne Bay, Sunny Isles Beach, South Beach, Coconut Grove, Coral Gables).
3. Enhance map preview card to display USD price, building name / neighborhood, and property link.
4. Add unit and interaction tests for USD pin formatting and Miami coordinate bounds.

## Boundaries & Constraints

**Always:** Dependency-free Web Mercator projection. Accessible buttons with ARIA labels and keyboard navigation (Escape to close preview). Responsive layout.

**Never:** Do not introduce external map libraries or heavy third-party map SDKs.

## Acceptance Criteria

- Given listings in Miami with `price_usd`, then map pins render compact USD format (e.g. `$25M`, `$4.75M`, `$3.85M`).
- Given map pins across Miami-Dade luxury corridor, they project with correct aspect ratio without distortion.
- Clicking a pin opens the preview card with USD price, neighborhood, and listing link.
- Unit and component tests pass.

</frozen-after-approval>

## Tasks

- [x] Create branch `story/S16-miami-map-view` and tag `S16-start`.
- [x] Update `src/lib/map-view.ts` with `formatPinPriceUsd` helper.
- [x] Update `src/components/SearchMap.tsx` to use USD formatting for pins and preview card.
- [x] Update tests in `src/components/SearchMap.test.tsx` / `SearchMapView.test.tsx` and `src/lib/map-view.test.ts`.
- [x] Run test suite and production build verification.
