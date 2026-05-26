'use client';

import { useCallback, useRef, useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Carousel, type CarouselHandle } from '@/components/ui/Carousel';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/types';

interface CategoryCarouselProps {
  title: string;
  products: Product[];
  viewAllHref?: string;
}

export function CategoryCarousel({ title, products, viewAllHref }: CategoryCarouselProps) {
  const carouselRef = useRef<CarouselHandle>(null);
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [isNextDisabled, setIsNextDisabled] = useState(false);

  const handleDisabledChange = useCallback(
    ({ isPrev, isNext }: { isPrev: boolean; isNext: boolean }) => {
      setIsPrevDisabled(isPrev);
      setIsNextDisabled(isNext);
    },
    [],
  );

  return (
    <section aria-label={`${title} collection`} className="py-12">
      <div className="site-container">
        <SectionHeader
          title={title}
          showArrows
          onPrev={() => carouselRef.current?.scrollPrev()}
          onNext={() => carouselRef.current?.scrollNext()}
          isPrevDisabled={isPrevDisabled}
          isNextDisabled={isNextDisabled}
          viewAllHref={viewAllHref}
          className="mb-8"
        />
        <Carousel
          ref={carouselRef}
          onDisabledChange={handleDisabledChange}
          trackClassName="snap-x snap-mandatory"
        >
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
