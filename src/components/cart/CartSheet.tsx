'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotal = useCartStore((s) => s.subtotal);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-0 z-50 h-screen w-full max-w-[430px] bg-background shadow-xl flex flex-col [right:max(0px,calc(50vw_-_215px))]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <Dialog.Title className="text-nav font-bold uppercase tracking-nav">
              Your Cart {items.length > 0 && `(${items.reduce((s, i) => s + i.quantity, 0)})`}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close cart"
                className="p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
              <ShoppingBag size={40} strokeWidth={1} className="text-muted-foreground" />
              <p className="text-product-title text-muted-foreground">Your cart is empty.</p>
              <Dialog.Close asChild>
                <Link
                  href="/"
                  className="text-nav font-medium uppercase tracking-nav underline underline-offset-4 hover:text-muted-foreground transition-colors"
                >
                  Continue Shopping
                </Link>
              </Dialog.Close>
            </div>
          ) : (
            <>
              <ul className="flex-1 overflow-y-auto divide-y divide-border px-6">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.size}`} className="flex gap-4 py-5">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 shrink-0 bg-border overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full bg-border" aria-hidden="true" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col gap-2 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-nav font-medium leading-snug">{item.name}</p>
                          <p className="text-badge text-muted-foreground uppercase tracking-nav">
                            Size: {item.size}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.productId, item.size)}
                          className="p-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground rounded-sm"
                        >
                          <X size={14} strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity stepper */}
                        <div className="flex items-center border border-border">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="px-2.5 py-1.5 text-foreground hover:bg-foreground/5 transition-colors focus-visible:outline-none"
                          >
                            <Minus size={12} strokeWidth={1.5} />
                          </button>
                          <span className="px-3 text-nav font-medium min-w-[2rem] text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="px-2.5 py-1.5 text-foreground hover:bg-foreground/5 transition-colors focus-visible:outline-none"
                          >
                            <Plus size={12} strokeWidth={1.5} />
                          </button>
                        </div>

                        <p className="text-nav font-bold">
                          {formatPrice(item.price * item.quantity, siteConfig.currency.symbol)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="border-t border-border px-6 py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-nav text-muted-foreground uppercase tracking-nav">Subtotal</span>
                  <span className="text-price font-bold">
                    {formatPrice(subtotal(), siteConfig.currency.symbol)}
                  </span>
                </div>
                <Dialog.Close asChild>
                  <Link
                    href="/checkout"
                    className="block w-full bg-foreground text-on-dark text-nav font-medium uppercase tracking-nav text-center py-4 hover:bg-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
                  >
                    Checkout →
                  </Link>
                </Dialog.Close>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
