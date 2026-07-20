'use server';

import { revalidatePath } from 'next/cache';
import { assertAdmin } from '@/lib/admin-auth';
import { updateOrderStatus } from '@/lib/data-store';
import type { Order } from '@/types';

type ActionResult = { success: boolean; error?: string };

const ORDER_STATUSES: Order['status'][] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export async function updateOrderStatusAction(
  id: string,
  status: Order['status'],
): Promise<ActionResult> {
  await assertAdmin();

  if (!ORDER_STATUSES.includes(status)) {
    return { success: false, error: 'Invalid order status' };
  }

  try {
    await updateOrderStatus(id, status);
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (e) {
    console.error('[admin] updateOrderStatus failed', e);
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update order status' };
  }
}
