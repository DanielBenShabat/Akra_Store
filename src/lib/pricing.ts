import { siteConfig } from '@/config/site';
import type { ShippingMethod } from '@/types';

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  total: number;
}

/** A priced line used for total calculation. Quantity defaults to 1 (1-of-1 model). */
export interface PricedLine {
  price: number;
  quantity?: number;
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

/** Sum of all line prices × quantity, rounded to 2 decimal places. */
export function subtotalOf(items: PricedLine[]): number {
  const raw = items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
  return Math.round(raw * 100) / 100;
}

/**
 * Aggregate the subtotal of every checkout line, add the flat shipping fee for
 * the chosen method, and produce the authoritative total. Server-side only.
 */
export function calculateTotals(items: PricedLine[], method: ShippingMethod): OrderTotals {
  const subtotal = subtotalOf(items);
  const shipping = shippingFor(subtotal, method);
  return { subtotal, shipping, total: subtotal + shipping };
}
