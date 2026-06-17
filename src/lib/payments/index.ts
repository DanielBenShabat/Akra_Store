import 'server-only';
import type { PaymentProvider } from './types';
import { simulatedProvider } from './simulated';
import { growProvider } from './grow';

export function getPaymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? 'simulated';
  switch (name) {
    case 'grow':
      return growProvider;
    // The simulated provider captures synchronously (status 'paid') for local dev.
    case 'simulated':
    default:
      return simulatedProvider;
  }
}

export type { PaymentProvider, PaymentRequest, PaymentResult } from './types';
