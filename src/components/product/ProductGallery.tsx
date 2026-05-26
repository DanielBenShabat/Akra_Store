import type { Product } from '@/types';
import { Placeholder } from '@/components/ui/Placeholder';

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  return (
    <div className="w-full">
      <Placeholder aspectRatio="4/5" variant="light" />
    </div>
  );
}
