import type { PaymentProvider, PaymentRequest, PaymentResult } from './types';

export const simulatedProvider: PaymentProvider = {
  name: 'simulated',

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    return {
      status: 'paid',
      reference: `SIM-${request.orderId}`,
    };
  },
};
