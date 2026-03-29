create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  stock_number text not null unique,
  number_plate text not null unique,
  make text not null,
  model text not null,
  variant text,
  year integer not null,
  fuel text not null,
  transmission text not null,
  km_driven integer not null default 0,
  color text,
  owner_count integer,
  price numeric(12, 2) not null default 0,
  location text not null,
  description text,
  seller_type text not null check (seller_type in ('dealer', 'private')),
  status text not null default 'available' check (status in ('available', 'booked', 'sold')),
  featured boolean not null default false,
  cover_image_url text
);

alter table public.listings
alter column status set default 'available';

drop trigger if exists set_listings_updated_at on public.listings;
create trigger set_listings_updated_at
before update on public.listings
for each row
execute function public.set_updated_at();

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0
);

create table if not exists public.sellers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null unique references public.listings(id) on delete cascade,
  name text not null,
  phone text not null,
  address text,
  notes text,
  seller_type text not null check (seller_type in ('dealer', 'private'))
);

create table if not exists public.buyers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null unique references public.listings(id) on delete cascade,
  name text,
  phone text,
  notes text,
  sold_price numeric(12, 2),
  sale_date date
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  doc_type text not null,
  file_url text not null,
  notes text
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  message text,
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.sellers enable row level security;
alter table public.buyers enable row level security;
alter table public.documents enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "Public can read available listings" on public.listings;
create policy "Public can read available listings"
on public.listings
for select
to public
using (status = 'available');

drop policy if exists "Authenticated users manage listings" on public.listings;
create policy "Authenticated users manage listings"
on public.listings
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read listing images for available listings" on public.listing_images;
create policy "Public can read listing images for available listings"
on public.listing_images
for select
to public
using (
  exists (
    select 1
    from public.listings
    where public.listings.id = listing_images.listing_id
      and public.listings.status = 'available'
  )
);

drop policy if exists "Authenticated users manage listing images" on public.listing_images;
create policy "Authenticated users manage listing images"
on public.listing_images
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read sellers for available listings" on public.sellers;
create policy "Public can read sellers for available listings"
on public.sellers
for select
to public
using (
  exists (
    select 1
    from public.listings
    where public.listings.id = sellers.listing_id
      and public.listings.status = 'available'
  )
);

drop policy if exists "Authenticated users manage sellers" on public.sellers;
create policy "Authenticated users manage sellers"
on public.sellers
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users manage buyers" on public.buyers;
create policy "Authenticated users manage buyers"
on public.buyers
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users manage documents" on public.documents;
create policy "Authenticated users manage documents"
on public.documents
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can create inquiries" on public.inquiries;
create policy "Public can create inquiries"
on public.inquiries
for insert
to public
with check (true);

drop policy if exists "Authenticated users read inquiries" on public.inquiries;
create policy "Authenticated users read inquiries"
on public.inquiries
for select
to authenticated
using (true);

drop policy if exists "Authenticated users manage inquiries" on public.inquiries;
create policy "Authenticated users manage inquiries"
on public.inquiries
for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

drop policy if exists "Public can view listing images bucket" on storage.objects;
create policy "Public can view listing images bucket"
on storage.objects
for select
to public
using (bucket_id = 'listing-photos');

drop policy if exists "Authenticated can manage listing images bucket" on storage.objects;
create policy "Authenticated can manage listing images bucket"
on storage.objects
for all
to authenticated
using (bucket_id = 'listing-photos')
with check (bucket_id = 'listing-photos');

drop policy if exists "Authenticated can view documents bucket" on storage.objects;
create policy "Authenticated can view documents bucket"
on storage.objects
for select
to authenticated
using (bucket_id = 'documents');

drop policy if exists "Authenticated can manage documents bucket" on storage.objects;
create policy "Authenticated can manage documents bucket"
on storage.objects
for all
to authenticated
using (bucket_id = 'documents')
with check (bucket_id = 'documents');
