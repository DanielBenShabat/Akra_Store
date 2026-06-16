'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { useCartStore, useCartHydrated, cartSubtotal } from '@/lib/cart-store';

export function CartDrawer() {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const isOpen = useCartStore((s) => s.isOpen);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const closeCart = useCartStore((s) => s.closeCart);

  if (!hydrated || !isOpen) return null;

  const symbol = siteConfig.currency.symbol;
  const subtotal = cartSubtotal(items);

  function proceedToCheckout() {
    closeCart();
    router.push('/checkout');
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={closeCart} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed top-0 z-50 h-screen w-80 max-w-[85vw] bg-background shadow-2xl flex flex-col"
        style={{ right: 'max(0px, calc((100vw - 430px) / 2))' }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <span className="text-nav font-bold uppercase tracking-nav">
            Cart{items.length > 0 ? ` · ${items.length}` : ''}
          </span>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            style={{ touchAction: 'manipulation', cursor: 'pointer' }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-nav font-medium uppercase tracking-nav">Your cart is empty</p>
            <p className="text-badge text-muted-foreground">Add a piece to get started.</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  <div className="relative w-16 h-16 shrink-0 bg-border overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full bg-border" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-nav font-medium leading-snug truncate">{item.name}</p>
                    <p className="text-badge text-muted-foreground">Size: {item.size}</p>
                    <p className="text-nav font-bold mt-0.5">{formatPrice(item.price, symbol)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="p-2 self-start text-muted-foreground hover:text-accent-warning transition-colors"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-6 py-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-nav uppercase tracking-nav text-muted-foreground">Subtotal</span>
                <span className="text-nav font-bold">{formatPrice(subtotal, symbol)}</span>
              </div>
              <p className="text-badge text-muted-foreground">
                Shipping is calculated at checkout.
              </p>
              <button
                type="button"
                onClick={proceedToCheckout}
                className="w-full bg-foreground text-on-dark text-nav font-medium uppercase tracking-nav py-4 hover:bg-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
