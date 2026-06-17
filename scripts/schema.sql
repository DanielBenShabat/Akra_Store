-- akra_store database schema (Supabase / PostgreSQL).
-- Run in the Supabase SQL editor to provision a fresh project.
-- Mirrors the live production schema (1-of-1 unique-item model).

create extension if not exists pgcrypto;

-- Fulfillment lifecycle for an order. Guarded so the script is re-runnable.
do $$ begin
  create type order_status as enum ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null;
end $$;

-- Shipping method chosen at checkout. `home` = courier, `pickup` = pick-up point.
do $$ begin
  create type shipping_method as enum ('home', 'pickup');
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
  image_urls    text[], -- ordered; first element is the primary thumbnail
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
  city            text not null,
  subtotal          numeric(10, 2) not null,
  shipping          numeric(10, 2) not null default 0,
  shipping_method   shipping_method not null default 'home',
  total             numeric(10, 2),
  status            order_status not null default 'pending',
  -- External gateway reference (e.g. Grow process id). Unique → webhook idempotency.
  payment_reference text,
  payment_provider  text,
  created_at        timestamptz not null default now()
);

-- Multiple NULLs are allowed; the uniqueness only bites once a reference is set.
create unique index if not exists orders_payment_reference_key on orders(payment_reference);

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

-- Conditionally reduce stock. Decrements only when enough stock is available
-- and returns whether the decrement succeeded. For the 1-of-1 model this means
-- a unit can be claimed exactly once: a second caller sees stock 0 and gets false.
create or replace function decrement_product_stock(p_id uuid, qty integer)
returns boolean language plpgsql as $$
declare
  affected integer;
begin
  update products
    set stock = stock - qty
    where id = p_id and stock >= qty;
  get diagnostics affected = row_count;
  return affected > 0;
end;
$$;

-- Atomically confirm an order: claim stock for every line item and flip the
-- order to 'confirmed' in a single transaction. If any line can't be claimed
-- (sold out), the whole thing rolls back and the order stays 'pending'.
-- Returns: 'confirmed' (just confirmed), 'already' (idempotent re-run),
-- 'not_found', or 'insufficient_stock'.
create or replace function confirm_order(p_order_id uuid)
returns text language plpgsql as $$
declare
  v_status order_status;
  rec record;
begin
  -- Lock the order row so concurrent confirmations serialize on it.
  select status into v_status from orders where id = p_order_id for update;
  if not found then
    return 'not_found';
  end if;
  if v_status <> 'pending' then
    return 'already';
  end if;

  for rec in
    select product_id, quantity from order_items where order_id = p_order_id
  loop
    if not decrement_product_stock(rec.product_id, rec.quantity) then
      raise exception 'INSUFFICIENT_STOCK';
    end if;
  end loop;

  update orders set status = 'confirmed' where id = p_order_id;
  return 'confirmed';
exception
  when others then
    -- Our sentinel rolls back all decrements above; surface it cleanly.
    -- Anything unexpected is re-raised so real errors aren't masked.
    if sqlerrm = 'INSUFFICIENT_STOCK' then
      return 'insufficient_stock';
    end if;
    raise;
end;
$$;
