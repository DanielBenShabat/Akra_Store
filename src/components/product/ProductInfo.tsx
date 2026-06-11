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

      <div className="inline-flex w-fit items-center gap-2 border border-border px-4 py-2">
        <span className="text-badge uppercase tracking-nav text-muted-foreground">Size</span>
        <span className="text-nav font-medium">{product.size}</span>
        <span className="text-badge uppercase tracking-nav text-muted-foreground">· 1 of 1</span>
      </div>

      <BuyNowButton product={product} />
    </div>
  );
}
