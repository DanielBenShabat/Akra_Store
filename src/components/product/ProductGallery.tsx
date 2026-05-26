import type { Product } from '@/types';
import { Placeholder } from '@/components/ui/Placeholder';

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  return (
    <div className="w-full">
      {product.imageUrl ? (
        <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      ) : (
        <Placeholder aspectRatio="4/5" variant="light" />
      )}
    </div>
  );
}
