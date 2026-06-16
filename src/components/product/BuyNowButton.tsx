'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types';

interface BuyNowButtonProps {
  product: Product;
}

export function BuyNowButton({ product }: BuyNowButtonProps) {
  const router = useRouter();
  const soldOut = product.stock < 1;

  function handleBuyNow() {
    if (soldOut) return;
    // Fast lane: this single item goes straight to checkout, bypassing the cart.
    const params = new URLSearchParams({ productId: product.id });
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <Button
      variant="default"
      className="w-full py-4 text-nav uppercase tracking-nav"
      onClick={handleBuyNow}
      disabled={soldOut}
    >
      {soldOut ? 'Sold Out' : 'Buy Now'}
    </Button>
  );
}
