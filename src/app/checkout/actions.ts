'use server';

import { supabase } from '@/lib/supabase';
import type { CartItem } from '@/lib/cart-store';

interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export async function placeOrderAction(
  shipping: ShippingData,
  items: CartItem[],
): Promise<{ orderId?: string; error?: string }> {
  if (!items.length) return { error: 'Cart is empty' };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      first_name: shipping.firstName,
      last_name: shipping.lastName,
      email: shipping.email,
      phone: shipping.phone,
      address: shipping.address,
      city: shipping.city,
      subtotal,
    })
    .select('id')
    .single();

  if (orderError || !order) return { error: orderError?.message ?? 'Failed to create order' };

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    name: item.name,
    size: item.size,
    price: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) return { error: itemsError.message };

  return { orderId: order.id };
}
