import 'server-only';
import type { PaymentProvider } from './types';
import { simulatedProvider } from './simulated';

export function getPaymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? 'simulated';
  switch (name) {
    // Real providers (e.g. 'grow', 'stripe') implement the same PaymentProvider
    // interface and are added here without changing the checkout action.
    case 'simulated':
    default:
      return simulatedProvider;
  }
}

export type { PaymentProvider, PaymentRequest, PaymentResult } from './types';
