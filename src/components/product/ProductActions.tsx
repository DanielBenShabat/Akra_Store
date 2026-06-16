'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/cart-store';
import type { Product } from '@/types';
import { BuyNowButton } from './BuyNowButton';

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const soldOut = product.stock < 1;
  const addItem = useCartStore((s) => s.addItem);

  function handleAddToCart() {
    if (soldOut) return;
    const result = addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: product.size,
      image: product.images[0] ?? null,
    });

    if (result === 'exists') {
      toast.info('This item is already in your cart');
    } else {
      toast.success('Added to cart');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <BuyNowButton product={product} />
      <Button
        variant="ghost"
        className="w-full py-4 text-nav uppercase tracking-nav border border-foreground disabled:opacity-50"
        onClick={handleAddToCart}
        disabled={soldOut}
      >
        {soldOut ? 'Sold Out' : 'Add to Cart'}
      </Button>
    </div>
  );
}
