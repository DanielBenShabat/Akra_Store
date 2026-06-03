-- akra_store database schema (Supabase / PostgreSQL).
-- Run in the Supabase SQL editor to provision a fresh project.

create extension if not exists pgcrypto;

create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  price       numeric(10, 2) not null,
  category    text not null check (category in ('tees', 'bottoms', 'accessories', 'socks', 'featured')),
  stock       integer not null default 0,
  description text,
  sizes       text[],
  image_url   text,
  created_at  timestamptz not null default now()
);

create table if not exists orders (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  last_name   text not null,
  email       text not null,
  phone       text not null,
  address     text not null,
  city        text not null,
  subtotal    numeric(10, 2) not null,
  created_at  timestamptz not null default now()
);

create table if not exists order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name       text not null,
  size       text not null,
  price      numeric(10, 2) not null,
  quantity   integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on order_items(order_id);
