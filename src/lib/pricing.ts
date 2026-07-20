import type { ShippingMethod } from '@/types';
import type { ShippingSettings } from './site-settings';

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
 * Server-side source of truth for shipping cost. Standard delivery is waived
 * once the subtotal crosses the free-shipping threshold; express remains paid;
 * free methods (e.g. `pickup`) are always 0.
 */
export function shippingFor(
  subtotal: number,
  method: ShippingMethod,
  settings: ShippingSettings,
): number {
  if (subtotal <= 0) return 0;
  const flatFee =
    method === 'express'
      ? settings.expressFee
      : method === 'standard'
        ? settings.standardFee
        : settings.pickupFee;
  if (flatFee === 0) return 0;
  if (
    method === 'standard' &&
    settings.freeStandardEnabled &&
    subtotal >= settings.freeStandardThreshold
  ) {
    return 0;
  }
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
export function calculateTotals(
  items: PricedLine[],
  method: ShippingMethod,
  settings: ShippingSettings,
): OrderTotals {
  const subtotal = subtotalOf(items);
  const shipping = shippingFor(subtotal, method, settings);
  return { subtotal, shipping, total: subtotal + shipping };
}
