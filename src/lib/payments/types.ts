export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  email: string;
}

export interface PaymentResult {
  status: 'paid' | 'pending' | 'failed';
  reference: string;
  redirectUrl?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
}
