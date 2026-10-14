---
title: 'S15 - Miami luxury database schema, USD pricing and seed data'
type: 'feature'
created: '2026-10-14'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '39eac4269e8b7462a637dbfba7f3aa41c61989bb'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The platform currently features listings located exclusively in Cali, Colombia, with Colombian Peso (COP) pricing and Colombian socioeconomic strata. Victoria Ordoñez is positioned as an elite Luxury & Waterfront Real Estate Advisor in Miami, Florida, USA, representing ultra-luxury residences such as Aston Martin Residences, Porsche Design Tower, Una Residences, and One Thousand Museum. The database and API must support USD pricing, HOA fees, square footage, building names, and authentic Miami luxury seed properties.

**Approach:** 
1. Create database migration `20261014000000_miami_luxury_schema.sql` adding `price_usd`, `hoa_fee_usd`, `area_sqft`, and `building_name` columns to `public.listings`.
2. Update `supabase/seed.sql` with 14 iconic Miami ultra-luxury residences (Aston Martin Residences, Porsche Design Tower, Una Residences, One Thousand Museum, 87 Park, Continuum South Beach, Fisher Island, Faena House, etc.) with genuine Miami coordinates and luxury attributes.
3. Update `src/lib/listings-query.ts` and `src/lib/listings.ts` to support Miami neighborhoods and USD pricing filters.

## Boundaries & Constraints

**Always:** Maintain backward compatibility for existing column fields. Preserve RLS policies allowing public select on published listings. Validate USD price > 0 when provided.

**Never:** Do not drop existing columns. Do not break existing API contracts or type definitions.

## Acceptance Criteria

- Given local Supabase, when migrations and seed are applied, `price_usd`, `hoa_fee_usd`, `area_sqft`, and `building_name` exist in `public.listings`.
- Given `supabase/seed.sql`, 14 Miami luxury listings are populated including Aston Martin Residences (Downtown Miami / 300 Biscayne Blvd Way), Porsche Design Tower (Sunny Isles Beach), Una Residences (Brickell), and other flagship towers.
- Given the listings query library, Miami neighborhoods (Brickell, Downtown Miami, Miami Beach, Sunny Isles Beach, Coconut Grove, Coral Gables, Edgewater, Surfside, Fisher Island) are recognized.
- Automated tests verify USD price handling and Miami neighborhood queries.

</frozen-after-approval>

## Tasks

- [x] Create `supabase/migrations/20261014000000_miami_luxury_schema.sql` adding `price_usd`, `hoa_fee_usd`, `area_sqft`, `building_name`.
- [x] Update `supabase/seed.sql` with 14 Miami ultra-luxury properties including Aston Martin Residences.
- [x] Update `src/lib/listings-query.ts` with MIAMI_NEIGHBORHOODS and USD pricing support.
- [x] Update `src/lib/listings.ts` to expose `price_usd` and support USD sorting/filtering.
- [x] Update unit and integration tests in `src/lib/listings-query.test.ts` and `src/lib/listings.test.ts`.
- [x] Run test suite and production build verification.

## Review Triage Log

- [x] [Review][Accept] Database schema migration applies non-destructive columns with check constraints (`price_usd`, `hoa_fee_usd`, `area_sqft`, `building_name`).
- [x] [Review][Accept] Seed data successfully models Aston Martin Residences, Porsche Design Tower, Una Residences, and 11 other premier Miami towers.
- [x] [Review][Accept] Proportional COP backing maintains full backward compatibility for legacy queries while enabling USD queries.
- [x] [Review][Accept] All 383 unit/integration tests pass in Vitest; production build clean.
