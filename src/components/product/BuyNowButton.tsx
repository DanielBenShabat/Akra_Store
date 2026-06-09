'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types';

interface BuyNowButtonProps {
  product: Product;
  selectedSize: string | null;
}

export function BuyNowButton({ product, selectedSize }: BuyNowButtonProps) {
  const router = useRouter();
  const hasSizes = !!product.sizes && product.sizes.length > 0;
  const size = hasSizes ? selectedSize : 'One Size';
  const disabled = hasSizes && !selectedSize;

  function handleBuyNow() {
    if (!size) return;
    const params = new URLSearchParams({ productId: product.id, size });
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <Button
      variant="default"
      className="w-full py-4 text-nav uppercase tracking-nav"
      onClick={handleBuyNow}
      disabled={disabled}
    >
      {disabled ? 'Select a Size' : 'Buy Now'}
    </Button>
  );
}
