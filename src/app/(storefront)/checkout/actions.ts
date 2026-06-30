'use server';

import { z } from 'zod';
import { createPendingOrder, quoteOrderTotals, UserFacingError } from '@/lib/data-store';
import { isValidCity } from '@/lib/israeli-cities';

const shippingMethodSchema = z.enum(['express', 'standard', 'pickup']);

const lineItemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
});

const inputSchema = z.object({
  items: z.array(lineItemSchema).min(1),
  shippingMethod: shippingMethodSchema,
  buyNowProductId: z.string().min(1).optional(),
  shipping: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(9),
    city: z.string().refine(isValidCity, 'Select a valid city'),
    street: z.string().min(2),
    houseNumber: z.string().min(1),
    postalCode: z.string().regex(/^\d{5,7}$/).optional().or(z.literal('')),
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
    const { postalCode, ...rest } = parsed.data.shipping;
    const { redirectUrl } = await createPendingOrder({
      items: parsed.data.items,
      shippingMethod: parsed.data.shippingMethod,
      buyNowProductId: parsed.data.buyNowProductId,
      shipping: { ...rest, postalCode: postalCode || undefined },
    });
    return { redirectUrl };
  } catch (e) {
    // Only surface curated business messages (e.g. "sold out"); log the rest.
    if (e instanceof UserFacingError) return { error: e.message };
    console.error('[checkout] createPendingOrder failed', e);
    return { error: 'Failed to create order. Please try again.' };
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
    console.error('[checkout] quoteOrderTotals failed', e);
    return {
      subtotal: 0,
      shipping: 0,
      total: 0,
      error: 'Could not calculate totals. Please try again.',
    };
  }
}
