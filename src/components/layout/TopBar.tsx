'use client';

import Link from 'next/link';
import { Menu, ShoppingBag } from 'lucide-react';
import { useNav } from './NavContext';
import { useCartStore, useCartHydrated } from '@/lib/cart-store';

export function TopBar() {
  const { openNav } = useNav();
  const hydrated = useCartHydrated();
  const itemCount = useCartStore((s) => s.items.length);
  const openCart = useCartStore((s) => s.openCart);

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
          <Link
            href="/"
            aria-label="AKRA — home"
            className="text-nav font-semibold tracking-[0.4em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm"
          >
            AKRA
          </Link>
        </div>

        <button
          type="button"
          aria-label={`Open cart${hydrated && itemCount > 0 ? `, ${itemCount} items` : ''}`}
          onClick={openCart}
          className="relative p-3 -mr-3 text-foreground hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm"
          style={{ touchAction: 'manipulation', cursor: 'pointer' }}
        >
          <ShoppingBag size={20} strokeWidth={1.5} />
          {hydrated && itemCount > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-foreground text-on-dark text-[10px] font-bold leading-none">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
