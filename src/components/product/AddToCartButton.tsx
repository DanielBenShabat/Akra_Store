'use client';

import { Button } from '@/components/ui/Button';

interface AddToCartButtonProps {
  productName: string;
}

export function AddToCartButton({ productName }: AddToCartButtonProps) {
  return (
    <Button
      variant="default"
      className="w-full py-4 text-nav uppercase tracking-nav"
      onClick={() => console.log(`Add to cart: ${productName}`)}
    >
      Add to Cart
    </Button>
  );
}
