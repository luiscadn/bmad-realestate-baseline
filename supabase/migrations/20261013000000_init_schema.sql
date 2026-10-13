-- S01: core schema for the real estate platform (agents, listings, listing_images, leads) with RLS.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- agents: one row per authenticated agent (id = auth.users.id)
-- ---------------------------------------------------------------------------
create table public.agents (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (length(btrim(full_name)) > 0),
  email text not null check (position('@' in email) > 1),
  phone text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- listings
-- ---------------------------------------------------------------------------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(btrim(title)) > 0),
  description text not null default '',
  operation text not null check (operation in ('sale', 'rent')),
  property_type text not null
    check (property_type in ('apartment', 'house', 'penthouse', 'townhouse', 'land', 'office', 'commercial')),
  price_cop bigint not null check (price_cop > 0),
  bedrooms smallint not null default 0 check (bedrooms >= 0),
  bathrooms smallint not null default 0 check (bathrooms >= 0),
  parking_spots smallint not null default 0 check (parking_spots >= 0),
  area_m2 numeric(10, 2) check (area_m2 is null or area_m2 > 0),
  neighborhood text not null,
  address text,
  city text not null default 'Cali',
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  featured boolean not null default false,
  published_at timestamptz,
  open_house_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_published_at_idx on public.listings (published_at desc) where published_at is not null;
create index listings_neighborhood_idx on public.listings (neighborhood);
create index listings_filter_idx on public.listings (operation, property_type, price_cop);
create index listings_agent_id_idx on public.listings (agent_id);

create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- listing_images (ordered gallery via position)
-- ---------------------------------------------------------------------------
create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  url text not null,
  alt_text text,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now()
);

create index listing_images_listing_position_idx on public.listing_images (listing_id, position);

-- ---------------------------------------------------------------------------
-- leads (contact-the-agent form submissions)
-- ---------------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  name text not null check (length(btrim(name)) > 0),
  email text not null check (position('@' in email) > 1),
  phone text,
  message text,
  created_at timestamptz not null default now()
);

create index leads_listing_id_idx on public.leads (listing_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.agents enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.leads enable row level security;

-- agents: public profiles (shown on listing detail); each agent manages only their own row.
create policy "agents are publicly readable"
  on public.agents for select
  to anon, authenticated
  using (true);

create policy "agents insert own profile"
  on public.agents for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "agents update own profile"
  on public.agents for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- listings: public sees only published; agents see and manage their own (drafts included).
create policy "public reads published listings"
  on public.listings for select
  to anon, authenticated
  using (published_at is not null and published_at <= now());

create policy "agents read own listings"
  on public.listings for select
  to authenticated
  using (agent_id = (select auth.uid()));

create policy "agents insert own listings"
  on public.listings for insert
  to authenticated
  with check (agent_id = (select auth.uid()));

create policy "agents update own listings"
  on public.listings for update
  to authenticated
  using (agent_id = (select auth.uid()))
  with check (agent_id = (select auth.uid()));

create policy "agents delete own listings"
  on public.listings for delete
  to authenticated
  using (agent_id = (select auth.uid()));

-- listing_images: visible when the parent listing is published; agents manage images of their listings.
create policy "public reads images of published listings"
  on public.listing_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_images.listing_id
        and l.published_at is not null
        and l.published_at <= now()
    )
  );

create policy "agents read images of own listings"
  on public.listing_images for select
  to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_images.listing_id and l.agent_id = (select auth.uid())
    )
  );

create policy "agents insert images on own listings"
  on public.listing_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_images.listing_id and l.agent_id = (select auth.uid())
    )
  );

create policy "agents update images on own listings"
  on public.listing_images for update
  to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_images.listing_id and l.agent_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_images.listing_id and l.agent_id = (select auth.uid())
    )
  );

create policy "agents delete images on own listings"
  on public.listing_images for delete
  to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_images.listing_id and l.agent_id = (select auth.uid())
    )
  );

-- leads: anyone may submit one for a published listing (or a general inquiry); only agents read them.
create policy "anyone submits leads"
  on public.leads for insert
  to anon, authenticated
  with check (
    listing_id is null
    or exists (
      select 1 from public.listings l
      where l.id = leads.listing_id
        and l.published_at is not null
        and l.published_at <= now()
    )
  );

create policy "agents read leads for own listings and general leads"
  on public.leads for select
  to authenticated
  using (
    (listing_id is null and exists (select 1 from public.agents a where a.id = (select auth.uid())))
    or exists (
      select 1 from public.listings l
      where l.id = leads.listing_id and l.agent_id = (select auth.uid())
    )
  );
