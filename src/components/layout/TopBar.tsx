'use client';

import { Menu } from 'lucide-react';
import { useNav } from './NavContext';

export function TopBar() {
  const { openNav } = useNav();

  return (
    <div className="h-topbar border-b border-border">
      <div className="px-4 h-full grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={openNav}
          className="p-3 -ml-3 text-foreground hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm"
          style={{ touchAction: 'manipulation', cursor: 'pointer' }}
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>

        <div className="flex justify-center">
          <span className="text-nav font-bold uppercase tracking-nav whitespace-nowrap select-none">
            Akra The Duck
          </span>
        </div>

        <div className="w-11" aria-hidden="true" />
      </div>
    </div>
  );
}
