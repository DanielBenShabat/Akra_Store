'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/IconButton';

export interface CarouselHandle {
  scrollPrev: () => void;
  scrollNext: () => void;
}

interface CarouselProps {
  children: React.ReactNode;
  /** Render built-in prev/next arrows flanking the scroll track */
  showArrows?: boolean;
  /** Called whenever boundary state changes — lets a parent header sync its own arrows */
  onDisabledChange?: (state: { isPrev: boolean; isNext: boolean }) => void;
  className?: string;
  trackClassName?: string;
}

export const Carousel = forwardRef<CarouselHandle, CarouselProps>(function Carousel(
  { children, showArrows = false, onDisabledChange, className, trackClassName },
  ref,
) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [isNextDisabled, setIsNextDisabled] = useState(false);

  const updateState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const atStart = el.scrollLeft <= 0;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    setIsPrevDisabled(atStart);
    setIsNextDisabled(atEnd);
  }, []);

  useEffect(() => {
    onDisabledChange?.({ isPrev: isPrevDisabled, isNext: isNextDisabled });
  }, [isPrevDisabled, isNextDisabled, onDisabledChange]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateState();
    el.addEventListener('scroll', updateState, { passive: true });
    const ro = new ResizeObserver(updateState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateState);
      ro.disconnect();
    };
  }, [updateState]);

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }, []);

  useImperativeHandle(ref, () => ({
    scrollPrev: () => scrollByPage(-1),
    scrollNext: () => scrollByPage(1),
  }));

  return (
    <div className={cn('relative', className)}>
      {showArrows && (
        <IconButton
          aria-label="Scroll left"
          icon={<ChevronLeft size={20} strokeWidth={1.5} />}
          onClick={() => scrollByPage(-1)}
          disabled={isPrevDisabled}
          className="hidden md:flex absolute left-0 top-1/3 -translate-y-1/2 -translate-x-1/2 z-10 w-9 h-9 bg-background border border-border disabled:opacity-30 disabled:cursor-not-allowed"
        />
      )}

      <div
        ref={trackRef}
        className={cn('flex gap-4 overflow-x-auto scrollbar-none', trackClassName)}
      >
        {children}
      </div>

      {showArrows && (
        <IconButton
          aria-label="Scroll right"
          icon={<ChevronRight size={20} strokeWidth={1.5} />}
          onClick={() => scrollByPage(1)}
          disabled={isNextDisabled}
          className="hidden md:flex absolute right-0 top-1/3 -translate-y-1/2 translate-x-1/2 z-10 w-9 h-9 bg-background border border-border disabled:opacity-30 disabled:cursor-not-allowed"
        />
      )}
    </div>
  );
});

Carousel.displayName = 'Carousel';
