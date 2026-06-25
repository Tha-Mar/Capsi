create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer,
  created_at timestamptz not null default now()
);

create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  collection text not null,
  category text not null,
  material text not null,
  fit text not null,
  availability text not null,
  description text,
  image_url text,
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_designs_updated_at on public.designs;

create trigger set_designs_updated_at
before update on public.designs
for each row
execute function public.set_updated_at();

alter table public.designs enable row level security;
alter table public.categories enable row level security;

drop policy if exists "Public can read categories" on public.categories;
drop policy if exists "Authenticated users can manage categories" on public.categories;
drop policy if exists "Public can read visible designs" on public.designs;
drop policy if exists "Authenticated users can manage designs" on public.designs;

create policy "Public can read categories"
on public.categories
for select
to anon, authenticated
using (true);

create policy "Authenticated users can manage categories"
on public.categories
for all
to authenticated
using (true)
with check (true);

create policy "Public can read visible designs"
on public.designs
for select
to anon, authenticated
using (is_visible = true);

create policy "Authenticated users can manage designs"
on public.designs
for all
to authenticated
using (true)
with check (true);

insert into public.categories (name, sort_order)
values
  ('Popular', 1),
  ('Sports', 2),
  ('Floral', 3),
  ('Geometric', 4),
  ('Animals', 5),
  ('Seasonal', 6),
  ('Classic', 7)
on conflict (name) do nothing;

insert into storage.buckets (id, name, public)
values ('design-images', 'design-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view design images" on storage.objects;
drop policy if exists "Authenticated users can upload design images" on storage.objects;
drop policy if exists "Authenticated users can update design images" on storage.objects;
drop policy if exists "Authenticated users can delete design images" on storage.objects;

create policy "Public can view design images"
on storage.objects
for select
to public
using (bucket_id = 'design-images');

create policy "Authenticated users can upload design images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'design-images');

create policy "Authenticated users can update design images"
on storage.objects
for update
to authenticated
using (bucket_id = 'design-images')
with check (bucket_id = 'design-images');

create policy "Authenticated users can delete design images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'design-images');

-- ---------------------------------------------------------------------------
-- Migration: unify data layer for inline editing (idempotent, safe to re-run)
-- ---------------------------------------------------------------------------

-- Stable slug so the one-time catalog import can upsert without duplicates.
alter table public.designs add column if not exists slug text;
create unique index if not exists designs_slug_key on public.designs (slug);

-- Retire unused legacy columns (kept nullable for backwards compatibility).
alter table public.designs alter column material drop not null;
alter table public.designs alter column fit drop not null;
alter table public.designs alter column availability drop not null;

-- Editable public text (hero + about). Public read, authenticated write.
create table if not exists public.site_content (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists set_site_content_updated_at on public.site_content;

create trigger set_site_content_updated_at
before update on public.site_content
for each row
execute function public.set_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "Public can read site content" on public.site_content;
drop policy if exists "Authenticated users can manage site content" on public.site_content;

create policy "Public can read site content"
on public.site_content
for select
to anon, authenticated
using (true);

create policy "Authenticated users can manage site content"
on public.site_content
for all
to authenticated
using (true)
with check (true);

-- Replace the stale placeholder categories with the live catalog's categories.
delete from public.categories
where name in ('Popular', 'Sports', 'Geometric', 'Classic');

insert into public.categories (name, sort_order)
values
  ('Healthcare', 1),
  ('Floral', 2),
  ('Animals', 3),
  ('Fan Club', 4),
  ('Dots & Scribbles', 5),
  ('Seasonal', 6),
  ('Patriotic', 7),
  ('Everyday', 8)
on conflict (name) do update set sort_order = excluded.sort_order;

-- Drop the original scaffolding design so the catalog starts from the real
-- import. While the table is empty the public site falls back to the bundled
-- local catalog, so visitors always see designs.
delete from public.designs
where collection = 'Signature Design 01' and slug is null;
