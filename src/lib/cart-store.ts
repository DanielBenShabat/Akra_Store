'use client';

import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

type AddResult = 'added' | 'exists';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** Adds a unique item. Returns 'exists' (and does nothing) if already present. */
  addItem: (item: CartItem) => AddResult;
  removeItem: (productId: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        // 1-of-1 model: a product can appear at most once, quantity is always 1.
        if (get().items.some((existing) => existing.productId === item.productId)) {
          return 'exists';
        }
        set((state) => ({ items: [...state.items, item], isOpen: true }));
        return 'added';
      },
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'akra-cart',
      // Persist only the items; the open/closed drawer state is ephemeral UI.
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** Client-side estimate; the server remains the source of truth for final totals. */
export function cartSubtotal(items: CartItem[]): number {
  const raw = items.reduce((sum, item) => sum + item.price, 0);
  return Math.round(raw * 100) / 100;
}

/**
 * True once the persisted (localStorage-backed) cart has rehydrated on the
 * client. Backed by zustand's hydration API via `useSyncExternalStore`, which
 * returns the server snapshot (false) during SSR/hydration and avoids mismatch.
 */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useCartStore.persist.onFinishHydration(onStoreChange),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}
