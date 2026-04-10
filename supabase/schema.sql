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

insert into public.designs (
  name,
  collection,
  category,
  material,
  fit,
  availability,
  description,
  image_url,
  is_featured,
  sort_order
)
values (
  'Pink Fox Print',
  'Signature Design 01',
  'Animals',
  'Lightweight quilting cotton with a breathable feel.',
  'Classic tie-back fit with roomy crown coverage.',
  'Available for custom orders',
  'Handmade custom scrub hat in a playful fox print.',
  '/DrWoof_Jan24_Ecomm8198-web_1600x.webp',
  true,
  1
)
on conflict do nothing;
