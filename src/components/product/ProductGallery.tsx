'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/types';
import { Placeholder } from '@/components/ui/Placeholder';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const { images, name } = product;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <Placeholder aspectRatio="4/5" variant="light" />;
  }

  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-[4/5]">
        <Image
          src={images[0]}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
    );
  }

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, index) => (
          <div key={src} className="relative w-full shrink-0 snap-center aspect-[4/5]">
            <Image
              src={src}
              alt={`${name} — view ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2" role="tablist" aria-label="Product images">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => goTo(index)}
            role="tab"
            aria-selected={active === index}
            aria-label={`Go to image ${index + 1}`}
            className={cn(
              'h-1.5 rounded-full transition-all',
              active === index ? 'w-6 bg-foreground' : 'w-1.5 bg-border',
            )}
          />
        ))}
      </div>
    </div>
  );
}
