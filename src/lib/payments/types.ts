export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  email: string;
  fullName?: string;
  phone?: string;
  description?: string;
  /**
   * When this order originates from the "Buy Now" fast lane, the single product
   * id is threaded into the gateway cancel URL so an abandoned payment returns
   * the customer to that isolated item's checkout (not an empty cart).
   */
  buyNowProductId?: string;
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
