-- Two Grow links per product (pickup price + delivery price).
--
-- Follows 2026-07-15_payment_links.sql. `products.payment_link` is the pickup /
-- item-only link; this adds `payment_link_delivery` (item price + delivery fee).
-- A single-item order pays one of these directly; multi-item orders pay per item
-- on the pay page (first item's delivery link folds in the one-time delivery fee).
--
-- Also drops the now-unused shared `deliveryPaymentLink` from the shipping
-- settings JSON (delivery is baked into each product's delivery link instead).
--
-- Safe to run more than once. Run in the Supabase SQL editor.

alter table products
  add column if not exists payment_link_delivery text;

update site_settings
set value = value - 'deliveryPaymentLink'
where key = 'shipping' and value ? 'deliveryPaymentLink';
