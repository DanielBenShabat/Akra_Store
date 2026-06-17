import 'server-only';
import { siteConfig } from '@/config/site';
import type { PaymentProvider, PaymentRequest, PaymentResult } from './types';

/**
 * Grow (formerly Meshulam) hosted-checkout provider.
 *
 * We create a payment process server-side and hand the browser Grow's hosted
 * `redirectUrl`. The customer pays on Grow; the authoritative confirmation
 * arrives asynchronously at our webhook (`/api/payments/webhook`) — never from
 * the browser's return URL.
 *
 * NOTE: the exact endpoint path, request field names, and response shape below
 * follow Grow/Meshulam's "createPaymentProcess" Light API. Confirm them against
 * your merchant integration guide; only this adapter changes if they differ.
 */

interface GrowCreateResponse {
  status: number; // 1 = success
  data?: {
    url?: string;
    processId?: number | string;
    processToken?: string;
  };
  err?: { message?: string };
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export const growProvider: PaymentProvider = {
  name: 'grow',

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    const apiBase =
      process.env.GROW_API_BASE ?? 'https://secure.meshulam.co.il/api/light/server/1.0';
    const pageCode = requiredEnv('GROW_PAGE_CODE');
    const userId = requiredEnv('GROW_USER_ID');
    const siteUrl = siteConfig.url;

    const params = new URLSearchParams();
    params.set('pageCode', pageCode);
    params.set('userId', userId);
    params.set('sum', request.amount.toFixed(2));
    params.set('description', request.description ?? `akra order ${request.orderId}`);
    params.set('paymentNum', '1');
    params.set('maxPaymentNum', '1');
    // `cField` is echoed back verbatim in the webhook → our order lookup key.
    params.set('cField', request.orderId);
    // Buy Now returns to its isolated item on cancel; cart checkout to /checkout.
    const cancelUrl = request.buyNowProductId
      ? `${siteUrl}/checkout?error=payment_failed&productId=${request.buyNowProductId}`
      : `${siteUrl}/checkout?error=payment_failed`;
    params.set('successUrl', `${siteUrl}/checkout/success?order=${request.orderId}`);
    params.set('cancelUrl', cancelUrl);
    params.set('notifyUrl', `${siteUrl}/api/payments/webhook`);
    params.set('pageField[email]', request.email);
    if (request.fullName) params.set('pageField[fullName]', request.fullName);
    if (request.phone) params.set('pageField[phone]', request.phone);

    const res = await fetch(`${apiBase}/createPaymentProcess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!res.ok) {
      throw new Error(`Grow API responded ${res.status}`);
    }

    const json = (await res.json()) as GrowCreateResponse;
    if (json.status !== 1 || !json.data?.url) {
      throw new Error(json.err?.message ?? 'Grow did not return a payment URL');
    }

    return {
      status: 'pending',
      reference: String(json.data.processId ?? json.data.processToken ?? request.orderId),
      redirectUrl: json.data.url,
    };
  },
};
