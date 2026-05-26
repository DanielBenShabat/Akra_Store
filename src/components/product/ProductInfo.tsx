import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { SizeSelector } from './SizeSelector';
import { AddToCartButton } from './AddToCartButton';

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

      {product.sizes && product.sizes.length > 0 && (
        <SizeSelector sizes={product.sizes} />
      )}

      <AddToCartButton productName={product.name} />
    </div>
  );
}
