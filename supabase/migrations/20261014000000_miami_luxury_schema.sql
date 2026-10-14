-- Migration: Add Miami Ultra-Luxury Real Estate Schema (USD pricing, HOA fee, sqft, building_name)
-- ===========================================================================

alter table public.listings
  add column if not exists price_usd numeric(14, 2) check (price_usd is null or price_usd > 0),
  add column if not exists hoa_fee_usd numeric(10, 2) check (hoa_fee_usd is null or hoa_fee_usd >= 0),
  add column if not exists area_sqft numeric(10, 2) check (area_sqft is null or area_sqft > 0),
  add column if not exists building_name text;

-- Default city to Miami for future listings
alter table public.listings alter column city set default 'Miami';

-- Compute price_usd from price_cop where not already set
update public.listings
set price_usd = round(price_cop / 4000.0, 2)
where price_usd is null and price_cop is not null;
