-- Migration: bring the live `orders` table in line with the app code.
-- The live DB predates the shipping work and is missing the `shipping` and
-- `shipping_method` columns that createPendingOrder() writes — without these,
-- every new checkout fails ("column orders.shipping_method does not exist").
--
-- `shipping_method` is plain TEXT (not an enum) so the 3 methods — and any
-- future ones — work without further DB migrations. Canonical values live in
-- src/config/site.ts: 'express' | 'standard' | 'pickup'.
--
-- Safe to run more than once (IF NOT EXISTS). Run in the Supabase SQL editor
-- (Dashboard → SQL) or via a direct Postgres connection.

alter table orders
  add column if not exists shipping numeric(10, 2) not null default 0;

alter table orders
  add column if not exists shipping_method text not null default 'express';

-- Cosmetic cleanup for existing category links. New/edited categories already use
-- the app's slugify() helper; this brings existing rows into the same format so
-- /category/[slug] URLs are clean, e.g. "TAMAR’S" -> "tamars".
update categories
set slug = trim(both '-' from regexp_replace(
  regexp_replace(lower(name), '[''’`]', '', 'g'),
  '[^a-z0-9]+',
  '-',
  'g'
))
where slug is distinct from trim(both '-' from regexp_replace(
  regexp_replace(lower(name), '[''’`]', '', 'g'),
  '[^a-z0-9]+',
  '-',
  'g'
));
