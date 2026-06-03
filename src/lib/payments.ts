import 'server-only';

export interface PaymentInput {
  orderId: string;
  amount: number;
  currency: string;
  email: string;
}

export interface PaymentResult {
  status: 'paid' | 'pending' | 'failed';
  reference?: string;
  redirectUrl?: string;
}

export interface PaymentProvider {
  name: string;
  createPayment: (input: PaymentInput) => Promise<PaymentResult>;
}

function mockProvider(): PaymentProvider {
  return {
    name: 'mock',
    createPayment: async (input) => ({
      status: 'paid',
      reference: `MOCK-${input.orderId.slice(0, 8).toUpperCase()}`,
    }),
  };
}

export function getPaymentProvider(): PaymentProvider {
  return mockProvider();
}
