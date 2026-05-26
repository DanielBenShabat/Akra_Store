import { SectionHeader } from '@/components/ui/SectionHeader';
import { Carousel } from '@/components/ui/Carousel';
import { ProductCard } from '@/components/product/ProductCard';
import { siteConfig } from '@/config/site';
import type { Product } from '@/types';

interface FeaturedCollectionProps {
  products: Product[];
  viewAllHref?: string;
}

export function FeaturedCollection({ products, viewAllHref = '/' }: FeaturedCollectionProps) {
  return (
    <section aria-label="Featured collection" className="py-12">
      <div className="site-container">
        <SectionHeader
          title={siteConfig.featuredCollectionTitle}
          viewAllHref={viewAllHref}
          className="mb-8"
        />
        <Carousel showArrows trackClassName="snap-x snap-mandatory">
          {products.map((product) => (
            <div
              key={product.id}
              className="shrink-0 snap-start w-[calc(50%-8px)] lg:w-[calc(20%-13px)]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
