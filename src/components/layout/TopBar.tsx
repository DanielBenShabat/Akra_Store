'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { CartButton } from '@/components/cart/CartButton';
import { NavSheet } from './NavSheet';

export function TopBar() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <div className="h-topbar border-b border-border">
        <div className="px-4 h-full grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setNavOpen(true)}
            className="p-3 -ml-3 cursor-pointer touch-action-manipulation text-foreground hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm"
            style={{ touchAction: 'manipulation' }}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>

          <div className="flex justify-center">
            <span className="text-nav font-bold uppercase tracking-nav whitespace-nowrap select-none">
              Akra The Duck
            </span>
          </div>

          <CartButton />
        </div>
      </div>

      <NavSheet open={navOpen} onOpenChange={setNavOpen} />
    </>
  );
}
