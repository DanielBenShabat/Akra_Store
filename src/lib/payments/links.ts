import 'server-only';
import { siteConfig } from '@/config/site';
import type { PaymentProvider, PaymentRequest, PaymentResult } from './types';

/**
 * "Payment links" provider — for merchants on Grow's link tier (no server API,
 * no confirmation webhook). We can't create a per-order charge or be notified
 * when it's paid, so this provider simply parks the order as `pending` and hands
 * the browser to our own "Complete your payment" page. That page lists the fixed
 * Grow link for each item (plus the shared delivery link). An admin marks the
 * order paid once the money lands in Grow — see `confirmPaidOrder` and the
 * Orders admin's "Mark as paid" action.
 */
export const linksProvider: PaymentProvider = {
  name: 'links',

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    return {
      status: 'pending',
      reference: `LINK-${request.orderId}`,
      redirectUrl: `${siteConfig.url}/checkout/pay/${request.orderId}`,
    };
  },
};
