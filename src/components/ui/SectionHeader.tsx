'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/IconButton';

interface SectionHeaderProps {
  title: string;
  showArrows?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  isPrevDisabled?: boolean;
  isNextDisabled?: boolean;
  viewAllHref?: string;
  className?: string;
}

export function SectionHeader({
  title,
  showArrows = false,
  onPrev,
  onNext,
  isPrevDisabled = false,
  isNextDisabled = false,
  viewAllHref,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="flex items-center gap-4">
        {showArrows && (
          <IconButton
            aria-label={`Previous ${title} items`}
            icon={<ChevronLeft size={20} strokeWidth={1.5} />}
            onClick={onPrev}
            disabled={isPrevDisabled}
            className="disabled:opacity-30 disabled:cursor-not-allowed"
          />
        )}

        <h2 className="text-section-title font-bold uppercase tracking-section">
          {title}
        </h2>

        {showArrows && (
          <IconButton
            aria-label={`Next ${title} items`}
            icon={<ChevronRight size={20} strokeWidth={1.5} />}
            onClick={onNext}
            disabled={isNextDisabled}
            className="disabled:opacity-30 disabled:cursor-not-allowed"
          />
        )}
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-view-all uppercase tracking-nav underline underline-offset-2 text-foreground hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm"
        >
          View All
        </Link>
      )}
    </div>
  );
}
