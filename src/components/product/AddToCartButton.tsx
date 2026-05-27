'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/cart-store';
import type { Product } from '@/types';

interface AddToCartButtonProps {
  product: Product;
  selectedSize: string | null;
}

export function AddToCartButton({ product, selectedSize }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    if (!selectedSize) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} added to cart`, { description: `Size: ${selectedSize}` });
  }

  return (
    <Button
      variant="default"
      className="w-full py-4 text-nav uppercase tracking-nav"
      onClick={handleAdd}
      disabled={!selectedSize}
    >
      {selectedSize ? 'Add to Cart' : 'Select a Size'}
    </Button>
  );
}
