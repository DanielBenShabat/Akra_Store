import Link from 'next/link';
import type { Product } from '@/types';
import { Placeholder } from '@/components/ui/Placeholder';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="flex flex-col gap-3">
      <Link
        href={`/product/${product.id}`}
        aria-label={product.name}
        className="relative w-full group block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground"
      >
        <div className="transition-transform duration-300 group-hover:scale-105">
          <Placeholder aspectRatio="1/1" variant="light" />
        </div>
      </Link>

      <div className="flex flex-col items-center gap-1 text-center px-1">
        <p className="text-product-title leading-snug">{product.name}</p>
        <p className="text-price font-bold">
          {formatPrice(product.price, siteConfig.currency.symbol)}
        </p>
      </div>
    </article>
  );
}
