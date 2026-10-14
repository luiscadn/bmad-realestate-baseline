---
title: 'S17 - Miami luxury brand identity, hero, editorial and catalogs'
type: 'feature'
created: '2026-10-14'
status: 'ready-for-dev'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'd25b49b2c2ba3afa647fe6e9d4ce7f68603c85dd'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The site's branding, copy, editorial sections, and catalogs currently position Victoria Ordoñez in Cali, Colombia. With her relocation to Miami, USA, the platform must reflect her status as an elite luxury real estate advisor specializing in world-class developments such as Aston Martin Residences, Porsche Design Tower, Una Residences, and waterfront estates across South Florida.

**Approach:**
1. Update bilingual message catalogs (`messages/es.json` and `messages/en.json`) with Miami ultra-luxury positioning, Brickell office contact details, Florida market insights, and US real estate terminology.
2. Update `HeroSearch.tsx`, `SearchFilters.tsx`, and `FeaturedListings.tsx` to use Miami neighborhoods (`MIAMI_NEIGHBORHOODS`) and USD pricing / square footage displays.
3. Update `ListingCard.tsx` to render USD prices when available, along with building names and square footage.
4. Update `HomeEditorial.tsx`, `Footer.tsx`, and metadata across the app.
5. Update unit and integration tests to verify translations, components, and full parity between `es` and `en`.

## Boundaries & Constraints

**Always:** Maintain 100% key parity between `messages/es.json` and `messages/en.json`. Keep clean typography, accessible semantic tags, and responsive layouts. Maintain backwards compatibility with legacy Colombian data if present.

**Never:** Do not break existing route slugs or introduce dead translation keys.

## Acceptance Criteria

- Bilingual catalogs feature Victoria Ordoñez as an elite Miami Luxury & Waterfront Real Estate Advisor (Brickell office, South Florida phone, luxury towers like Aston Martin Residences).
- Hero section and search filters populate with Miami luxury neighborhoods (Brickell, Downtown Miami, Sunny Isles Beach, Miami Beach, etc.).
- ListingCard and featured residences showcase USD pricing and square footage.
- Editorial sections highlight Florida luxury investment, private aviation/yacht amenities, and advisory.
- 100% key parity is maintained between `es` and `en` message catalogs.
- All test suites pass and production build succeeds.

</frozen-after-approval>

## Tasks

- [ ] Create branch `story/S17-miami-brand-identity` and tag `S17-start`.
- [ ] Update `messages/es.json` and `messages/en.json` with Miami luxury copy.
- [ ] Update `SearchFilters.tsx` and `HeroSearch.tsx` to use `MIAMI_NEIGHBORHOODS`.
- [ ] Update `ListingCard.tsx` to format USD prices and display square footage.
- [ ] Update component and layout tests (`Home.test.tsx`, `HomeEditorial.test.tsx`, `ListingCard.test.tsx`, `Footer.test.tsx`, `SearchFilters.test.tsx`).
- [ ] Run test suite and production build verification.
