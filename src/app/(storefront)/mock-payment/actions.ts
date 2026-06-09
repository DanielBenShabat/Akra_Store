'use server';

import { z } from 'zod';
import { updateOrderStatus } from '@/lib/data-store';

const schema = z.object({
  orderId: z.string().min(1),
  status: z.enum(['paid', 'failed']),
});

export interface UpdateOrderStatusResult {
  success?: boolean;
  error?: string;
}

export async function updateOrderStatusAction(
  orderId: string,
  status: 'paid' | 'failed',
): Promise<UpdateOrderStatusResult> {
  const parsed = schema.safeParse({ orderId, status });
  if (!parsed.success) return { error: 'Invalid request' };

  try {
    await updateOrderStatus(parsed.data.orderId, parsed.data.status);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to update order' };
  }
}
