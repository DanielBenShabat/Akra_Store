'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { CartSheet } from './CartSheet';

export function CartButton() {
  const [open, setOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount);

  return (
    <>
      <button
        type="button"
        aria-label="Shopping bag"
        onClick={() => setOpen(true)}
        className="relative inline-flex items-center justify-center p-2 shrink-0 text-foreground transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm"
      >
        <ShoppingBag size={18} strokeWidth={1.5} />
        {itemCount() > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-on-dark text-[10px] font-bold leading-none">
            {itemCount() > 99 ? '99+' : itemCount()}
          </span>
        )}
      </button>

      <CartSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
