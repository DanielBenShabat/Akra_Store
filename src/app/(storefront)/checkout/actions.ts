'use server';

import { z } from 'zod';
import { createPendingOrder } from '@/lib/data-store';

const inputSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
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
      shipping: parsed.data.shipping,
    });
    return { orderId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to create order' };
  }
}
