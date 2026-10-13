-- Colombian socioeconomic stratum (estrato 1-6) and monthly HOA/administration fee, both optional.
alter table public.listings
  add column stratum smallint check (stratum is null or stratum between 1 and 6),
  add column admin_fee_cop bigint check (admin_fee_cop is null or admin_fee_cop >= 0);
