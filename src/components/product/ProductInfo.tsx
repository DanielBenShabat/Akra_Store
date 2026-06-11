'use client';

import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { BuyNowButton } from './BuyNowButton';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
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

      <p className="text-nav text-muted-foreground">
        Size: <span className="font-medium text-foreground">{product.size}</span>
      </p>

      <BuyNowButton product={product} />
    </div>
  );
}
