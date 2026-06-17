'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/cart-store';
import { updateOrderStatusAction } from './actions';

interface Props {
  orderId: string;
  /** Set only for the "Buy Now" fast lane, so a failed payment returns to that item. */
  productId: string | null;
}

export function MockPaymentClient({ orderId, productId }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<'paid' | 'failed' | null>(null);

  async function handle(status: 'paid' | 'failed') {
    setPending(status);
    const result = await updateOrderStatusAction(orderId, status);

    if (result.error) {
      toast.error(result.error);
      setPending(null);
      return;
    }

    if (status === 'paid') {
      // Definitive confirmation: purge the persisted cart, but only for a
      // cart-mode order. Buy Now carries a productId and never touches the cart.
      if (!productId) useCartStore.getState().clear();
      router.push(`/checkout/success?order=${orderId}`);
      return;
    }

    // Cart-mode failures return to the cart-driven checkout; Buy Now failures
    // return to the same single item via its productId.
    const params = new URLSearchParams({ error: 'payment_failed' });
    if (productId) params.set('productId', productId);
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => handle('paid')}
        className="w-full bg-foreground text-on-dark text-nav font-medium uppercase tracking-nav py-4 hover:bg-foreground/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
      >
        {pending === 'paid' ? 'Processing…' : 'Simulate Successful Payment'}
      </button>

      <button
        type="button"
        disabled={pending !== null}
        onClick={() => handle('failed')}
        className="w-full border border-border text-foreground text-nav font-medium uppercase tracking-nav py-4 hover:bg-foreground/5 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
      >
        {pending === 'failed' ? 'Processing…' : 'Simulate Failure'}
      </button>
    </div>
  );
}
