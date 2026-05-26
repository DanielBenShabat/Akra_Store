'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SizeSelectorProps {
  sizes: string[];
}

export function SizeSelector({ sizes }: SizeSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-badge uppercase tracking-nav font-medium">Size</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setSelected(size)}
            className={cn(
              'px-4 py-2 text-nav font-medium border transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground',
              selected === size
                ? 'bg-foreground text-on-dark border-foreground'
                : 'bg-transparent text-foreground border-border hover:border-foreground',
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
