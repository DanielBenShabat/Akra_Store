import { siteConfig } from '@/config/site';

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  total: number;
}

export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= siteConfig.shipping.freeThreshold ? 0 : siteConfig.shipping.flatFee;
}

export function calculateTotals(subtotal: number): OrderTotals {
  const shipping = shippingFor(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
}
