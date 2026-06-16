'use client';

import Link from 'next/link';
import type { CartItem } from '@/types';
import { useCartStore, useCartHydrated } from '@/lib/cart-store';
import { CheckoutForm } from './CheckoutForm';

interface Props {
  mode: 'buynow' | 'cart';
  buyNowItem: CartItem | null;
  buyNowProductId: string | null;
  symbol: string;
  paymentFailed: boolean;
}

function EmptyState() {
  return (
    <div className="border border-border p-8 flex flex-col items-center text-center gap-4">
      <p className="text-nav font-medium uppercase tracking-nav">Your cart is empty</p>
      <p className="text-badge text-muted-foreground">Add a piece to get started.</p>
      <Link
        href="/"
        className="text-badge text-foreground uppercase tracking-nav underline underline-offset-4 hover:text-muted-foreground transition-colors"
      >
        ← Continue Shopping
      </Link>
    </div>
  );
}

export function CheckoutClient({
  mode,
  buyNowItem,
  buyNowProductId,
  symbol,
  paymentFailed,
}: Props) {
  const hydrated = useCartHydrated();
  const cartItems = useCartStore((s) => s.items);

  const items = mode === 'buynow' ? (buyNowItem ? [buyNowItem] : []) : cartItems;

  // In cart mode the items come from localStorage; wait for hydration so we
  // don't flash an empty state before the persisted cart is available.
  if (mode === 'cart' && !hydrated) {
    return <div className="h-40 border border-border animate-pulse bg-foreground/5" aria-hidden="true" />;
  }

  if (items.length === 0) return <EmptyState />;

  return (
    <CheckoutForm
      items={items}
      symbol={symbol}
      paymentFailed={paymentFailed}
      clearCartOnSuccess={mode === 'cart'}
      buyNowProductId={buyNowProductId}
    />
  );
}
