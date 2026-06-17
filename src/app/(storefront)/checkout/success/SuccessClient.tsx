'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';

interface Props {
  status: string;
  productIds: string[];
}

/**
 * Client-side effects for the order confirmation page:
 *  - On a confirmed order, purge exactly the purchased items from the cart.
 *    (No-op for Buy Now, whose item was never in the cart.) This is the only
 *    place the cart is cleared, and only after definitive confirmation.
 *  - While still 'pending' (gateway webhook in flight), poll for the update.
 */
export function SuccessClient({ status, productIds }: Props) {
  const router = useRouter();
  const productIdsKey = productIds.join(',');

  useEffect(() => {
    if (status !== 'confirmed') return;
    const remove = useCartStore.getState().removeItem;
    for (const id of productIdsKey ? productIdsKey.split(',') : []) remove(id);
  }, [status, productIdsKey]);

  useEffect(() => {
    if (status !== 'pending') return;
    const timer = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(timer);
  }, [status, router]);

  return null;
}
