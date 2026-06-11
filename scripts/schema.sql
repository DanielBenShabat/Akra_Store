-- akra_store database schema (Supabase / PostgreSQL).
-- Run in the Supabase SQL editor to provision a fresh project.
-- Mirrors the live production schema (1-of-1 unique-item model).

create extension if not exists pgcrypto;

-- Fulfillment lifecycle for an order. Guarded so the script is re-runnable.
do $$ begin
  create type order_status as enum ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null;
end $$;

create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

-- 1-of-1 model: every product is a unique piece — `sizes` holds exactly one
-- element and `stock` defaults to 1 (1 = available, 0 = sold).
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  price         numeric(10, 2) not null,
  stock         integer not null default 1,
  description   text,
  sizes         text[],
  image_url     text,
  category_id   uuid references categories(id) on delete set null,
  is_goosebumps boolean not null default false
);

create table if not exists archive_items (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null,
  x_position numeric not null,
  y_position numeric not null,
  size       numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id         uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name  text not null,
  email      text not null,
  phone      text not null,
  address    text not null,
  city       text not null,
  subtotal   numeric(10, 2) not null,
  total      numeric(10, 2),
  status     order_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- `product_id` mirrors the originating product but is not a foreign key in
-- production, so a product can be deleted without affecting historical orders.
create table if not exists order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  product_id uuid not null,
  name       text not null,
  size       text not null,
  price      numeric(10, 2) not null,
  quantity   integer not null check (quantity > 0)
);

create index if not exists order_items_order_id_idx on order_items(order_id);

-- Row Level Security: all data access is server-side via the Supabase service
-- role key, which bypasses RLS. Enabling RLS without public policies therefore
-- denies all direct client (anon / authenticated) access by default.
alter table orders enable row level security;
alter table order_items enable row level security;

-- Atomically reduce stock on order confirmation, floored at 0 (never negative).
create or replace function decrement_product_stock(p_id uuid, qty integer)
returns void language sql as $$
  update products set stock = greatest(stock - qty, 0) where id = p_id;
$$;
