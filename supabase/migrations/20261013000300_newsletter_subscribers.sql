-- S13: newsletter subscribers. Anon may subscribe (insert) but never read, so emails cannot be harvested.
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null
    constraint newsletter_subscribers_email_key unique
    constraint newsletter_subscribers_email_check check (
      email = lower(email) and length(email) <= 254 and position('@' in email) > 1
    ),
  name text check (name is null or (length(btrim(name)) > 0 and length(name) <= 200)),
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "anyone can subscribe"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

-- No anon select policy: public reads are denied by default. Only agents can view subscribers.
create policy "agents read subscribers"
  on public.newsletter_subscribers for select
  to authenticated
  using (exists (select 1 from public.agents a where a.id = (select auth.uid())));
