'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { assertAdmin } from '@/lib/admin-auth';
import { updateOrderStatus, confirmPaidOrder, CACHE_TAGS } from '@/lib/data-store';
import type { Order } from '@/types';

type ActionResult = { success: boolean; error?: string };

const ORDER_STATUSES: Order['status'][] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

/** Bust the catalog cache after a stock change so the storefront reflects the sale. */
function revalidateAfterConfirm(): void {
  revalidateTag(CACHE_TAGS.catalog, 'max');
  revalidatePath('/admin/orders');
  revalidatePath('/', 'layout');
  revalidatePath('/available');
  revalidatePath('/goosebumps');
}

/**
 * Confirm payment for an order the customer paid via a Grow link. Routes through
 * the atomic `confirm_order` RPC so stock is claimed exactly once and the
 * confirmation email fires — never a bare status write.
 */
export async function markOrderPaidAction(id: string): Promise<ActionResult> {
  await assertAdmin();
  try {
    const result = await confirmPaidOrder(id);
    switch (result) {
      case 'confirmed':
      case 'already':
        revalidateAfterConfirm();
        return { success: true };
      case 'insufficient_stock':
        revalidateAfterConfirm();
        return { success: false, error: 'One or more items are sold out — the order was cancelled.' };
      case 'not_found':
        return { success: false, error: 'Order not found.' };
      default:
        return { success: false, error: 'Could not confirm the order.' };
    }
  } catch (e) {
    console.error('[admin] markOrderPaid failed', e);
    return { success: false, error: e instanceof Error ? e.message : 'Failed to confirm order' };
  }
}

export async function updateOrderStatusAction(
  id: string,
  status: Order['status'],
): Promise<ActionResult> {
  await assertAdmin();

  if (!ORDER_STATUSES.includes(status)) {
    return { success: false, error: 'Invalid order status' };
  }

  // Confirming from the dropdown must also claim stock + send the receipt, so
  // route it through the same atomic path as "Mark as paid".
  if (status === 'confirmed') {
    return markOrderPaidAction(id);
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
