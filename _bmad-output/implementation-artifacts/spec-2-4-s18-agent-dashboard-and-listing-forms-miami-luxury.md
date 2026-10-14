---
title: 'S18 - Agent dashboard and listing forms for Miami luxury properties'
type: 'feature'
created: '2026-10-14'
status: 'ready-for-review'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'eb0ced2be879aa9cfc30292723377db3fc53e5e4'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The agent dashboard and listing creation/editing forms currently expect COP currency and lack native support for Miami luxury parameters such as USD pricing, HOA/condo fees, square footage, and building names (e.g. Aston Martin Residences, Porsche Design Tower).

**Approach:**
1. Update `agent-listings.ts` and `dashboard.ts` to validate and serialize `price_usd`, `hoa_fee_usd`, `area_sqft`, and `building_name`, maintaining seamless bi-directional synchronization with `price_cop` and `area_m2`.
2. Update `ListingsTable.tsx` to display formatted USD prices and building names for Miami residences.
3. Update `ListingForm.tsx` and dashboard translation labels for USD prices, HOA fees, and square footage.
4. Add unit and component tests verifying USD table formatting, validation, and API payload generation.

## Boundaries & Constraints

**Always:** Maintain strict input validation and security checks. Preserve backwards compatibility with existing rows and tests. Ensure all form fields remain accessible with clear ARIA labels and error states.

**Never:** Do not bypass authenticated agent checks or post unvalidated data.

## Acceptance Criteria

- Agent listings table renders formatted USD currency (`$25,000,000`, `$4,750,000`) and displays building names when present.
- Create/Edit forms validate USD pricing, HOA fees, and Miami neighborhoods.
- Full parity between `price_usd` and `price_cop` is preserved.
- All tests pass and production build succeeds.

</frozen-after-approval>

## Tasks

- [x] Create branch `story/S18-miami-dashboard` and tag `S18-start`.
- [x] Update `src/lib/agent-listings.ts` and `src/lib/dashboard.ts` to support `price_usd`, `hoa_fee_usd`, `area_sqft`, and `building_name`.
- [x] Update `src/components/ListingsTable.tsx` with USD price formatting and building badges.
- [x] Update dashboard translation labels in `messages/es.json` and `messages/en.json`.
- [x] Update tests in `ListingsTable.test.tsx`, `ListingForm.test.tsx`, and `agent-listings.test.ts`.
- [x] Run test suite and production build verification.
