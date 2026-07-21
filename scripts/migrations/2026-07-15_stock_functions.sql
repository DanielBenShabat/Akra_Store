-- Create the atomic stock / order-confirmation functions on the live DB.
--
-- These are defined in scripts/schema.sql (the full snapshot) but were never
-- migrated to production, so confirmPaidOrder()'s `confirm_order` RPC fails at
-- checkout with: "Could not find the function public.confirm_order(p_order_id)".
-- That surfaces to the shopper as "Failed to create order."
--
-- `v_status` is read as text so this works whether orders.status is the
-- order_status enum or plain text. Safe to run more than once.
-- Run in the Supabase SQL editor.

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

create or replace function confirm_order(p_order_id uuid)
returns text language plpgsql as $$
declare
  v_status text;
  rec record;
begin
  -- Lock the order row so concurrent confirmations serialize on it.
  select status::text into v_status from orders where id = p_order_id for update;
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
    if sqlerrm = 'INSUFFICIENT_STOCK' then
      return 'insufficient_stock';
    end if;
    raise;
end;
$$;
