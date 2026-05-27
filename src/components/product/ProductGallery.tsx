import Image from 'next/image';
import type { Product } from '@/types';
import { Placeholder } from '@/components/ui/Placeholder';

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  return (
    <div className="w-full">
      {product.imageUrl ? (
        <div className="relative w-full aspect-[4/5]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      ) : (
        <Placeholder aspectRatio="4/5" variant="light" />
      )}
    </div>
  );
}
