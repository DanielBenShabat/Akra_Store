'use server';

import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { calculateTotals } from '@/lib/pricing';
import { getPaymentProvider } from '@/lib/payments';
import { siteConfig } from '@/config/site';

const shippingSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(9),
  address: z.string().min(5),
  city: z.string().min(1),
});

const lineSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
  quantity: z.number().int().positive(),
});

export interface ProcessPaymentInput {
  shipping: z.infer<typeof shippingSchema>;
  items: z.infer<typeof lineSchema>[];
}

export interface ProcessPaymentResult {
  orderId?: string;
  redirectUrl?: string;
  error?: string;
}

export async function processPayment(input: ProcessPaymentInput): Promise<ProcessPaymentResult> {
  const shipping = shippingSchema.safeParse(input.shipping);
  if (!shipping.success) return { error: 'Invalid shipping details' };

  const lines = z.array(lineSchema).min(1).safeParse(input.items);
  if (!lines.success) return { error: 'Your cart is empty' };

  const productIds = [...new Set(lines.data.map((l) => l.productId))];
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price')
    .in('id', productIds);
  if (productsError) return { error: productsError.message };

  const byId = new Map((products ?? []).map((p) => [p.id, p]));

  let subtotal = 0;
  const orderItems = [];
  for (const line of lines.data) {
    const product = byId.get(line.productId);
    if (!product) return { error: 'A product in your cart is no longer available' };
    subtotal += product.price * line.quantity;
    orderItems.push({
      product_id: product.id,
      name: product.name,
      size: line.size,
      price: product.price,
      quantity: line.quantity,
    });
  }

  const totals = calculateTotals(subtotal);
  const provider = getPaymentProvider();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      first_name: shipping.data.firstName,
      last_name: shipping.data.lastName,
      email: shipping.data.email,
      phone: shipping.data.phone,
      address: shipping.data.address,
      city: shipping.data.city,
      subtotal: totals.subtotal,
      shipping_cost: totals.shipping,
      total: totals.total,
      currency: siteConfig.currency.code,
      status: 'pending',
      payment_provider: provider.name,
    })
    .select('id')
    .single();
  if (orderError || !order) return { error: orderError?.message ?? 'Failed to create order' };

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
  if (itemsError) return { error: itemsError.message };

  const payment = await provider.createPayment({
    orderId: order.id,
    amount: totals.total,
    currency: siteConfig.currency.code,
    email: shipping.data.email,
  });

  if (payment.status === 'paid') {
    await supabase
      .from('orders')
      .update({ status: 'paid', payment_reference: payment.reference })
      .eq('id', order.id);
    return { orderId: order.id };
  }

  if (payment.status === 'failed') {
    await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return { error: 'Payment was declined. Please try again.' };
  }

  return { orderId: order.id, redirectUrl: payment.redirectUrl };
}
