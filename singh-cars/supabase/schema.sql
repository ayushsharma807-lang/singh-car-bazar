create extension if not exists "pgcrypto";

create table if not exists sellers (
  id uuid primary key default gen_random_uuid(),
  seller_type text not null check (seller_type in ('dealer', 'private')),
  name text not null,
  phone text not null,
  address text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers(id) on delete set null,
  slug text not null unique,
  stock_number text not null unique,
  number_plate text not null unique,
  make text not null,
  model text not null,
  variant text,
  year int not null,
  registration_year int,
  fuel text not null,
  transmission text not null,
  km_driven int not null default 0,
  color text,
  owner_number int,
  price numeric(12, 2) not null default 0,
  location text not null,
  description text,
  featured boolean not null default false,
  status text not null default 'available' check (status in ('available', 'booked', 'sold')),
  is_published boolean not null default true,
  seller_type text not null default 'dealer' check (seller_type in ('dealer', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists buyers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null unique references listings(id) on delete cascade,
  name text,
  phone text,
  notes text,
  sale_date date,
  sold_price numeric(12, 2),
  created_at timestamptz not null default now()
);

create table if not exists listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  image_url text not null,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists listing_documents (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  document_type text not null,
  file_name text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  message text,
  car_title text,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('car-media', 'car-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('car-documents', 'car-documents', false)
on conflict (id) do nothing;
