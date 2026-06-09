'use client';

import { useState } from 'react';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { SizeSelector } from './SizeSelector';
import { BuyNowButton } from './BuyNowButton';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-section-title font-bold uppercase tracking-section">
          {product.name}
        </h1>
        <p className="text-price font-bold">
          {formatPrice(product.price, siteConfig.currency.symbol)}
        </p>
      </div>

      {product.description && (
        <p className="text-product-title text-muted-foreground leading-relaxed">
          {product.description}
        </p>
      )}

      {product.sizes && product.sizes.length > 0 && (
        <SizeSelector
          sizes={product.sizes}
          selected={selectedSize}
          onSelect={setSelectedSize}
        />
      )}

      <BuyNowButton product={product} selectedSize={selectedSize} />
    </div>
  );
}
