import 'server-only';
import type { PaymentProvider } from './types';
import { simulatedProvider } from './simulated';
import { growProvider } from './grow';
import { linksProvider } from './links';

export function getPaymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? 'simulated';
  switch (name) {
    case 'grow':
      return growProvider;
    // Static Grow payment links + our own pay page; confirmed manually by admin.
    case 'links':
      return linksProvider;
    // The simulated provider captures synchronously (status 'paid') for local dev.
    case 'simulated':
    default:
      return simulatedProvider;
  }
}

export type { PaymentProvider, PaymentRequest, PaymentResult } from './types';
