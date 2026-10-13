-- S02: public-read storage bucket for listing photos with owner-scoped write policies.
-- Object path convention: {listing_id}/{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public GET: anyone may read objects in the bucket.
create policy "listing images are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'listing-images');

-- Authenticated agents write only inside the folder of a listing they own.
create policy "agents upload images for own listings"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-images'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and l.agent_id = (select auth.uid())
    )
  );

create policy "agents update images of own listings"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listing-images'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and l.agent_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'listing-images'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and l.agent_id = (select auth.uid())
    )
  );

create policy "agents delete images of own listings"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-images'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and l.agent_id = (select auth.uid())
    )
  );

-- Gallery ordering: position uniqueness is not enforced (a reorder updates several rows);
-- readers order by (position, created_at) so ties are stable.
create index if not exists listing_images_listing_position_created_idx
  on public.listing_images (listing_id, position, created_at);
