import { siteConfig } from '@/config/site';
import type { ShippingMethod } from '@/types';

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  total: number;
}

/**
 * Server-side source of truth for shipping cost. `home` delivery is the flat
 * fee, waived once the subtotal crosses the free-shipping threshold; `pickup`
 * is always its (cheaper) flat rate.
 */
export function shippingFor(subtotal: number, method: ShippingMethod): number {
  if (subtotal <= 0) return 0;
  const { flatFee } = siteConfig.shipping.methods[method];
  if (method === 'home' && subtotal >= siteConfig.shipping.freeThreshold) return 0;
  return flatFee;
}

export function calculateTotals(subtotal: number, method: ShippingMethod): OrderTotals {
  const shipping = shippingFor(subtotal, method);
  return { subtotal, shipping, total: subtotal + shipping };
}
