'use server';

import { z } from 'zod';
import { createPendingOrder, quoteOrderTotals } from '@/lib/data-store';

const shippingMethodSchema = z.enum(['home', 'pickup']);

const inputSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
  shippingMethod: shippingMethodSchema,
  shipping: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(9),
    address: z.string().min(5),
    city: z.string().min(1),
  }),
});

export interface CreatePendingOrderResult {
  orderId?: string;
  error?: string;
}

export async function createPendingOrderAction(
  input: z.infer<typeof inputSchema>,
): Promise<CreatePendingOrderResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid order details' };

  try {
    const { orderId } = await createPendingOrder({
      productId: parsed.data.productId,
      size: parsed.data.size,
      quantity: 1,
      shippingMethod: parsed.data.shippingMethod,
      shipping: parsed.data.shipping,
    });
    return { orderId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to create order' };
  }
}

const quoteSchema = z.object({
  productId: z.string().min(1),
  shippingMethod: shippingMethodSchema,
});

export interface QuoteOrderResult {
  subtotal: number;
  shipping: number;
  total: number;
  error?: string;
}

/**
 * Server-side re-calculation of totals for the selected shipping method.
 * The client supplies only the method; all pricing stays on the server.
 */
export async function quoteOrderAction(
  input: z.infer<typeof quoteSchema>,
): Promise<QuoteOrderResult> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) {
    return { subtotal: 0, shipping: 0, total: 0, error: 'Invalid quote request' };
  }

  try {
    const totals = await quoteOrderTotals(parsed.data.productId, parsed.data.shippingMethod);
    return totals;
  } catch (e) {
    return {
      subtotal: 0,
      shipping: 0,
      total: 0,
      error: e instanceof Error ? e.message : 'Failed to calculate totals',
    };
  }
}
