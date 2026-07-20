-- Grow payment-links checkout.
--
-- The store charges via static Grow payment links (one per product) instead of
-- the server API. This adds the per-product link column, makes 'standard' the
-- default shipping method (Express was removed), and adds the shared delivery
-- payment link to the shipping settings JSON.
--
-- Safe to run more than once. Run in the Supabase SQL editor.

-- Per-product Grow payment link (fixed-price link that charges for this piece).
alter table products
  add column if not exists payment_link text;

-- Express delivery was removed; new orders default to Standard.
alter table orders
  alter column shipping_method set default 'standard';

-- Shipping settings JSON: drop the now-unused expressFee, add the shared
-- Standard-delivery payment link (null until the admin sets it in /admin/settings).
update site_settings
set value = (value - 'expressFee') || jsonb_build_object('deliveryPaymentLink', null)
where key = 'shipping'
  and not (value ? 'deliveryPaymentLink');
