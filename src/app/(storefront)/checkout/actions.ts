'use server';

import { z } from 'zod';
import { createPendingOrder, quoteOrderTotals } from '@/lib/data-store';

const shippingMethodSchema = z.enum(['home', 'pickup']);

const lineItemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
});

const inputSchema = z.object({
  items: z.array(lineItemSchema).min(1),
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
  /** Where the browser should go next: the gateway's hosted page, or our success page. */
  redirectUrl?: string;
  error?: string;
}

export async function createPendingOrderAction(
  input: z.infer<typeof inputSchema>,
): Promise<CreatePendingOrderResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid order details' };

  try {
    const { redirectUrl } = await createPendingOrder({
      items: parsed.data.items,
      shippingMethod: parsed.data.shippingMethod,
      shipping: parsed.data.shipping,
    });
    return { redirectUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to create order' };
  }
}

const quoteSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1),
  shippingMethod: shippingMethodSchema,
});

export interface QuoteOrderResult {
  subtotal: number;
  shipping: number;
  total: number;
  error?: string;
}

/**
 * Server-side re-calculation of totals for the given items + shipping method.
 * The client supplies only product ids and the method; all pricing stays on
 * the server, sourced from authoritative product prices.
 */
export async function quoteOrderAction(
  input: z.infer<typeof quoteSchema>,
): Promise<QuoteOrderResult> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) {
    return { subtotal: 0, shipping: 0, total: 0, error: 'Invalid quote request' };
  }

  try {
    const totals = await quoteOrderTotals(parsed.data.productIds, parsed.data.shippingMethod);
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
